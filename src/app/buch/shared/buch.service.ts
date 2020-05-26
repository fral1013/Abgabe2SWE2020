/* eslint-disable max-lines,no-null/no-null */

/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { BASE_URI, BUECHER_PATH_REST } from '../../shared';
import type { BuchArt, BuchServer, Verlag } from './buch';
import type {
    ChartColor,
    ChartConfiguration,
    ChartData,
    ChartDataSets,
} from 'chart.js';
import { FindError, RemoveError, SaveError } from './errors';
// Bereitgestellt durch HttpClientModule
// HttpClientModule enthaelt nur Services, keine Komponenten
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';
import { Buch } from './buch';
import { DiagrammService } from '../../shared/diagramm.service';
import { Injectable } from '@angular/core';
// https://github.com/ReactiveX/rxjs/blob/master/src/internal/Subject.ts
// https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts
import { Subject } from 'rxjs';

// Methoden der Klasse HttpClient
//  * get(url, options) – HTTP GET request
//  * post(url, body, options) – HTTP POST request
//  * put(url, body, options) – HTTP PUT request
//  * patch(url, body, options) – HTTP PATCH request
//  * delete(url, options) – HTTP DELETE request

// Eine Service-Klasse ist eine "normale" Klasse gemaess ES 2015, die mittels
// DI in eine Komponente injiziert werden kann, falls sie innerhalb von
// provider: [...] bei einem Modul oder einer Komponente bereitgestellt wird.
// Eine Komponente realisiert gemaess MVC-Pattern den Controller und die View.
// Die Anwendungslogik wird vom Controller an Service-Klassen delegiert.

/**
 * Die Service-Klasse zu B&uuml;cher wird zum "Root Application Injector"
 * hinzugefuegt und ist in allen Klassen der Webanwendung verfuegbar.
 */
/* eslint-disable no-underscore-dangle */
@Injectable({ providedIn: 'root' })
export class BuchService {
    // Observables = Event-Streaming mit Promises
    // Subject statt Basisklasse Observable:
    // in find() und findById() wird next() aufgerufen
    readonly buecherSubject = new Subject<Array<Buch>>();

    readonly buchSubject = new Subject<Buch>();

    readonly errorSubject = new Subject<string | number>();

    private readonly baseUriBuecher!: string;

    private _buch!: Buch;

    /**
     * @param diagrammService injizierter DiagrammService
     * @param httpClient injizierter Service HttpClient (von Angular)
     * @return void
     */
    constructor(
        private readonly diagrammService: DiagrammService,
        private readonly httpClient: HttpClient,
    ) {
        this.baseUriBuecher = `${BASE_URI}/${BUECHER_PATH_REST}`;
        console.log(
            `BuchService.constructor(): baseUriBuch=${this.baseUriBuecher}`,
        );
    }

    /**
     * Ein Buch-Objekt puffern.
     * @param buch Das Buch-Objekt, das gepuffert wird.
     * @return void
     */
    set buch(buch: Buch) {
        console.log('BuchService.set buch()', buch);
        this._buch = buch;
    }

    /**
     * Buecher anhand von Suchkriterien suchen
     * @param suchkriterien Die Suchkriterien
     * @returns Gefundene Buecher oder Statuscode des fehlerhaften GET-Requests
     */
    // eslint-disable-next-line unicorn/no-useless-undefined
    async find(suchkriterien: Suchkriterien | undefined = undefined) {
        console.log('BuchService.find(): suchkriterien=', suchkriterien);
        const params = this.suchkriterienToHttpParams(suchkriterien);
        const uri = this.baseUriBuecher;
        console.log(`BuchService.find(): uri=${uri}`);

        // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
        // das mit einem Flow von Kotlin vergleichbar ist.
        // Mit einem Subscription Objekt kann man den Request auch abbrechen ("cancel")
        // https://angular.io/guide/http
        // https://stackoverflow.com/questions/37364973/what-is-the-difference-between-promises-and-observables#answer-37365955
        // https://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
        // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
        // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md

        let buecher;
        try {
            const buecherServer = await this.httpClient
                .get<Array<BuchServer>>(uri, { params })
                .toPromise();
            buecher = buecherServer.map(buch => Buch.fromServer(buch));
        } catch (err) {
            throw this.buildFindError(err);
        }

        console.log('BuchService.find(): buecher=', buecher);
        return buecher;

        // Same-Origin-Policy verhindert Ajax-Datenabfragen an einen Server in
        // einer anderen Domain. JSONP (= JSON mit Padding) ermoeglicht die
        // Uebertragung von JSON-Daten ueber Domaingrenzen.
        // In Angular gibt es dafuer den Service Jsonp.
    }

    /**
     * Ein Buch anhand der ID suchen
     * @param id Die ID des gesuchten Buchs
     */
    async findById(id: string | undefined) {
        console.log(`BuchService.findById(): id=${id}`);

        // Gibt es ein gepuffertes Buch mit der gesuchten ID und Versionsnr.?
        if (
            this._buch !== undefined &&
            this._buch._id === id &&
            this._buch.version !== undefined
        ) {
            console.log(
                `BuchService.findById(): Buch gepuffert, version=${this._buch.version}`,
            );
            return this._buch;
        }

        if (id === undefined) {
            console.log('BuchService.findById(): Keine Id');
            return;
        }

        // wegen fehlender Versionsnummer (im ETag) nachladen
        console.log('BuchService.findById(): GET-Request');
        const uri = `${this.baseUriBuecher}/${id}`;
        let response;
        try {
            // Observable.subscribe() aus RxJS liefert ein Subscription Objekt
            response = await this.httpClient
                .get<BuchServer>(uri, { observe: 'response' })
                .toPromise();
        } catch (err) {
            throw this.buildFindError(err);
        }

        const { body } = response;
        if (body === null) {
            return;
        }
        const etag = response.headers.get('ETag') ?? undefined;
        console.log(`etag = ${etag}`);

        this._buch = Buch.fromServer(body, etag);
        return this._buch;
    }

    /**
     * Ein neues Buch anlegen
     * @param neuesBuch Das JSON-Objekt mit dem neuen Buch
     */
    async save(buch: Buch) {
        console.log('BuchService.save(): buch=', buch);
        buch.datum = new Date();

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
        });

        // Subscription von RxJS als Promise
        let response;
        try {
            response = await this.httpClient
                .post(this.baseUriBuecher, buch.toJSON(), {
                    headers,
                    observe: 'response',
                    responseType: 'text',
                })
                .toPromise();
        } catch (err) {
            console.error('BuchService.save(): err=', err);
            throw new SaveError(err.status, err.error, err);
        }

        console.log('BuchService.save(): map(): response', response);
        const location = response.headers.get('Location');
        return location?.slice(location.lastIndexOf('/') + 1);
    }

    /**
     * Ein vorhandenes Buch aktualisieren
     * @param buch Das JSON-Objekt mit den aktualisierten Buchdaten
     * @param successFn Die Callback-Function fuer den Erfolgsfall
     * @param errorFn Die Callback-Function fuer den Fehlerfall
     */
    async update(
        buch: Buch,
        successFn: () => Promise<void>,
        errorFn: (
            status: number,
            errors: { [s: string]: unknown } | undefined,
        ) => void,
    ) {
        console.log('BuchService.update(): buch=', buch);

        const { version } = buch;
        if (version === undefined) {
            console.error(`Keine Versionsnummer fuer das Buch ${buch._id}`);
            return;
        }
        const successFnPut = async () => {
            await successFn();
            // Wenn Update erfolgreich war, dann wurde serverseitig die Versionsnr erhoeht
            if (buch.version === undefined) {
                buch.version = 1;
            } else {
                buch.version++;
            }
        };

        const errorFnPut = (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
                console.error(
                    'Client-seitiger oder Netzwerkfehler',
                    err.error.message,
                );
            } else if (errorFn === undefined) {
                console.error('errorFnPut', err);
            } else {
                errorFn(err.status, err.error);
            }
        };

        const uri = `${this.baseUriBuecher}/${buch._id}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
            'If-Match': `"${version}"`,
        });
        console.log('headers=', headers);
        try {
            await this.httpClient.put(uri, buch, { headers }).toPromise();
        } catch (err) {
            errorFnPut(err);
            return;
        }

        await successFnPut();
    }

    /**
     * Ein Buch l&ouml;schen
     * @param buch Das JSON-Objekt mit dem zu loeschenden Buch
     */
    async remove(buch: Buch) {
        console.log('BuchService.remove(): buch=', buch);
        const uri = `${this.baseUriBuecher}/${buch._id}`;

        try {
            await this.httpClient.delete(uri).toPromise();
        } catch (err) {
            console.log('BuchService.remove(): err=', err);
            throw new RemoveError(err.status);
        }
    }

    // http://www.sitepoint.com/15-best-javascript-charting-libraries
    // http://thenextweb.com/dd/2015/06/12/20-best-javascript-chart-libraries
    // http://mikemcdearmon.com/portfolio/techposts/charting-libraries-using-d3

    // D3 (= Data Driven Documents) https://d3js.org ist das fuehrende Produkt
    // fuer Datenvisualisierung:
    //  initiale Version durch die Dissertation von Mike Bostock
    //  gesponsort von der New York Times, seinem heutigen Arbeitgeber
    //  basiert auf SVG = scalable vector graphics: Punkte, Linien, Kurven, ...
    //  ca 250.000 Downloads/Monat bei https://www.npmjs.com
    //  https://github.com/mbostock/d3 mit ueber 100 Contributors

    // Weitere Alternativen:
    // Google Charts: https://google-developers.appspot.com/chart
    // Chartist.js:   http://gionkunz.github.io/chartist-js
    // n3-chart:      http://n3-charts.github.io/line-chart

    // Chart.js ist deutlich einfacher zu benutzen als D3
    //  basiert auf <canvas>
    //  ca 25.000 Downloads/Monat bei https://www.npmjs.com
    //  https://github.com/nnnick/Chart.js mit ueber 60 Contributors

    /**
     * Ein Balkendiagramm erzeugen und bei einem Tag <code>canvas</code>
     * einf&uuml;gen.
     * @param chartElement Das HTML-Element zum Tag <code>canvas</code>
     */
    async createBarChart(chartElement: HTMLCanvasElement) {
        console.log('BuchService.createBarChart()');
        const buecher = await this.find();

        const buecherGueltig = buecher.filter(
            b => b._id !== undefined && b.rating !== undefined,
        );

        const labels = buecherGueltig
            .map(b => b._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('BuchService.createBarChart(): labels:', labels);

        const data = buecherGueltig.map(b => b.rating);
        const datasets: Array<ChartDataSets> = [{ label: 'Bewertung', data }];

        const config: ChartConfiguration = {
            type: 'bar',
            data: { labels, datasets },
        };
        return this.diagrammService.createChart(chartElement, config);
    }

    /**
     * Ein Liniendiagramm erzeugen und bei einem Tag <code>canvas</code>
     * einf&uuml;gen.
     * @param chartElement Das HTML-Element zum Tag <code>canvas</code>
     */
    async createLinearChart(chartElement: HTMLCanvasElement) {
        console.log('BuchService.createLinearChart()');
        const buecher = await this.find();
        const buecherGueltig = buecher.filter(
            b => b._id !== undefined && b.rating !== undefined,
        );

        const labels = buecherGueltig
            .map(b => b._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('BuchService.createLinearChart(): labels:', labels);

        const data = buecherGueltig.map(b => b.rating);
        const datasets: Array<ChartDataSets> = [{ label: 'Bewertung', data }];

        const config: ChartConfiguration = {
            type: 'line',
            data: { labels, datasets },
        };
        return this.diagrammService.createChart(chartElement, config);
    }

    /**
     * Ein Tortendiagramm erzeugen und bei einem Tag <code>canvas</code>
     * einf&uuml;gen.
     * @param chartElement Das HTML-Element zum Tag <code>canvas</code>
     */
    async createPieChart(chartElement: HTMLCanvasElement) {
        console.log('BuchService.createPieChart()');
        const buecher = await this.find();
        const buecherGueltig = buecher.filter(
            b => b._id !== undefined && b.rating !== undefined,
        );

        const labels = buecherGueltig
            .map(b => b._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('BuchService.createPieChart(): labels:', labels);

        const ratings = buecherGueltig.map(b => b.rating);
        const backgroundColor: Array<ChartColor> = [];
        const hoverBackgroundColor: Array<ChartColor> = [];
        for (let i = 0; i < ratings.length; i++) {
            backgroundColor.push(this.diagrammService.getBackgroundColor(i));
            hoverBackgroundColor.push(
                this.diagrammService.getHoverBackgroundColor(i),
            );
        }

        const data: ChartData = {
            labels,
            datasets: [
                {
                    data: ratings,
                    backgroundColor,
                    hoverBackgroundColor,
                },
            ],
        };

        const config: ChartConfiguration = { type: 'pie', data };
        this.diagrammService.createChart(chartElement, config);
    }

    /**
     * Suchkriterien in Request-Parameter konvertieren.
     * @param suchkriterien Suchkriterien fuer den GET-Request.
     * @return Parameter fuer den GET-Request
     */
    private suchkriterienToHttpParams(
        suchkriterien: Suchkriterien | undefined,
    ): HttpParams {
        console.log(
            'BuchService.suchkriterienToHttpParams(): suchkriterien=',
            suchkriterien,
        );
        let httpParams = new HttpParams();

        if (suchkriterien === undefined) {
            return httpParams;
        }

        const { titel, verlag, art, schlagwoerter } = suchkriterien;
        const { javascript, typescript } = schlagwoerter;

        if (titel !== '') {
            httpParams = httpParams.set('titel', titel);
        }
        if (art !== '') {
            httpParams = httpParams.set('art', art);
        }
        if (verlag !== '') {
            httpParams = httpParams.set('verlag', verlag);
        }
        if (javascript) {
            httpParams = httpParams.set('javascript', 'true');
        }
        if (typescript) {
            httpParams = httpParams.set('typescript', 'true');
        }
        return httpParams;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private buildFindError(err: any) {
        if (err.error instanceof ProgressEvent) {
            const msg = 'Client-seitiger oder Netzwerkfehler';
            console.error(msg, err.error);
            return new FindError(-1, msg, err);
        }

        const { status, error }: { status: number; error: string } = err;
        console.log(
            `BuchService.buildFindError(): status=${status}, Response-Body=${error}`,
        );
        return new FindError(status, error, err);
    }
}
/* eslint-enable no-underscore-dangle */

export interface Suchkriterien {
    titel: string;
    verlag: Verlag | '';
    art: BuchArt | '';
    schlagwoerter: { javascript: boolean; typescript: boolean };
}
/* eslint-enable max-lines,no-null/no-null */
