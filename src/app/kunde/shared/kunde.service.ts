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

import { BASE_URI, KUNDEN_PATH_REST } from '../../shared';
import type {
    ChartColor,
    ChartConfiguration,
    ChartData,
    ChartDataSets,
} from 'chart.js';
import type { Familienstand, Geschlecht, KundeServer } from './kunde';
import { FindError, RemoveError, SaveError } from './errors';
// Bereitgestellt durch HttpClientModule
// HttpClientModule enthaelt nur Services, keine Komponenten
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';
import { DiagrammService } from '../../shared/diagramm.service';
import { Injectable } from '@angular/core';
import { Kunde } from './kunde';
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
export class KundeService {
    // Observables = Event-Streaming mit Promises
    // Subject statt Basisklasse Observable:
    // in find() und findById() wird next() aufgerufen
    readonly kundenSubject = new Subject<Array<Kunde>>();

    readonly kundeSubject = new Subject<Kunde>();

    readonly errorSubject = new Subject<string | number>();

    private readonly baseUriKunden!: string;

    private _kunde!: Kunde;

    /**
     * @param diagrammService injizierter DiagrammService
     * @param httpClient injizierter Service HttpClient (von Angular)
     * @return void
     */
    constructor(
        private readonly diagrammService: DiagrammService,
        private readonly httpClient: HttpClient,
    ) {
        this.baseUriKunden = `${BASE_URI}/${KUNDEN_PATH_REST}`;
        console.log(
            `KundeService.constructor(): baseUriKunde=${this.baseUriKunden}`,
        );
    }

    /**
     * Ein Kunde-Objekt puffern.
     * @param kunde Das Kunde-Objekt, das gepuffert wird.
     * @return void
     */
    set kunde(kunde: Kunde) {
        console.log('KundeService.set kunde()', kunde);
        this._kunde = kunde;
    }

    /**
     * Kunden anhand von Suchkriterien suchen
     * @param suchkriterien Die Suchkriterien
     * @returns Gefundene Kunden oder Statuscode des fehlerhaften GET-Requests
     */
    // eslint-disable-next-line unicorn/no-useless-undefined
    async find(suchkriterien: Suchkriterien | undefined = undefined) {
        console.log('KundeService.find(): suchkriterien=', suchkriterien);
        const params = this.suchkriterienToHttpParams(suchkriterien);
        const uri = this.baseUriKunden;
        console.log(`KundeService.find(): uri=${uri}`);

        // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
        // das mit einem Flow von Kotlin vergleichbar ist.
        // Mit einem Subscription Objekt kann man den Request auch abbrechen ("cancel")
        // https://angular.io/guide/http
        // https://stackoverflow.com/questions/37364973/what-is-the-difference-between-promises-and-observables#answer-37365955
        // https://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
        // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
        // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md

        const kunden: Array<Kunde> = [];
        try {
            const response = await this.httpClient
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .get<any>(uri, { params })
                .toPromise();

            const kundeList = response._embedded.kundeList as Array<
                KundeServer
            >;
            kundeList.forEach(kunde => kunden.push(Kunde.fromServer(kunde)));
        } catch (err) {
            console.log(err.message);
            throw this.buildFindError(err);
        }

        console.log('KundeService.find(): kunden=', kunden);
        return kunden;

        // Same-Origin-Policy verhindert Ajax-Datenabfragen an einen Server in
        // einer anderen Domain. JSONP (= JSON mit Padding) ermoeglicht die
        // Uebertragung von JSON-Daten ueber Domaingrenzen.
        // In Angular gibt es dafuer den Service Jsonp.
    }

    /**
     * Ein Kunde anhand der ID suchen
     * @param id Die ID des gesuchten Kunden
     */
    async findById(id: string | undefined) {
        console.log(`KundeService.findById(): id=${id}`);

        // Gibt es ein gepuffertes Kunde mit der gesuchten ID und Versionsnr.?
        if (
            this._kunde !== undefined &&
            this._kunde._id === id &&
            this._kunde.version !== undefined
        ) {
            console.log(
                `KundeService.findById(): Kunde gepuffert, version=${this._kunde.version}`,
            );
            return this._kunde;
        }

        if (id === undefined) {
            console.log('KundeService.findById(): Keine Id');
            return;
        }

        // wegen fehlender Versionsnummer (im ETag) nachladen
        console.log('KundeService.findById(): GET-Request');
        const uri = `${this.baseUriKunden}/${id}`;
        let response;
        try {
            // Observable.subscribe() aus RxJS liefert ein Subscription Objekt
            response = await this.httpClient
                .get<KundeServer>(uri, { observe: 'response' })
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

        this._kunde = Kunde.fromServer(body, etag);
        return this._kunde;
    }

    /**
     * Ein neues Kunde anlegen
     * @param neuesKunde Das JSON-Objekt mit dem neuen Kunde
     */
    async save(kunde: Kunde) {
        console.log('KundeService.save(): kunde=', kunde);
        // kunde.geburtsdatum = new Date();

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
        });

        // Subscription von RxJS als Promise
        let response;
        try {
            response = await this.httpClient
                .post(this.baseUriKunden, kunde.toJSON(), {
                    headers,
                    observe: 'response',
                    responseType: 'text',
                })
                .toPromise();
        } catch (err) {
            console.error('KundeService.save(): err=', err);
            throw new SaveError(err.status, err.error, err);
        }

        console.log('KundeService.save(): map(): response', response);
        const location = response.headers.get('Location');
        return location?.slice(location.lastIndexOf('/') + 1);
    }

    /**
     * Ein vorhandenes Kunde aktualisieren
     * @param kunde Das JSON-Objekt mit den aktualisierten Kundendaten
     * @param successFn Die Callback-Function fuer den Erfolgsfall
     * @param errorFn Die Callback-Function fuer den Fehlerfall
     */
    async update(
        kunde: Kunde,
        successFn: () => Promise<void>,
        errorFn: (
            status: number,
            errors: { [s: string]: unknown } | undefined,
        ) => void,
    ) {
        console.log('KundeService.update(): kunde=', kunde);

        const { version } = kunde;
        if (version === undefined) {
            console.error(`Keine Versionsnummer fuer das Kunde ${kunde._id}`);
            return;
        }
        const successFnPut = async () => {
            await successFn();
            // Wenn Update erfolgreich war, dann wurde serverseitig die Versionsnr erhoeht
            if (kunde.version === undefined) {
                kunde.version = 1;
            } else {
                kunde.version++;
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

        const uri = `${this.baseUriKunden}/${kunde._id}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
            'If-Match': `"${version}"`,
        });
        console.log('headers=', headers);
        try {
            await this.httpClient.put(uri, kunde, { headers }).toPromise();
        } catch (err) {
            errorFnPut(err);
            return;
        }

        await successFnPut();
    }

    /**
     * Ein Kunde l&ouml;schen
     * @param kunde Das JSON-Objekt mit dem zu loeschenden Kunde
     */
    async remove(kunde: Kunde) {
        console.log('KundeService.remove(): kunde=', kunde);
        const uri = `${this.baseUriKunden}/${kunde._id}`;

        try {
            await this.httpClient.delete(uri).toPromise();
        } catch (err) {
            console.log('KundeService.remove(): err=', err);
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
        console.log('KundeService.createBarChart()');
        const kunden = await this.find();

        const kundenGueltig = kunden.filter(
            k => k._id !== undefined && k.kategorie !== undefined,
        );

        const labels = kundenGueltig
            .map(k => k._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('KundeService.createBarChart(): labels:', labels);

        const data = kundenGueltig.map(k => k.kategorie);
        const datasets: Array<ChartDataSets> = [{ label: 'Kategorie', data }];

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
        console.log('KundeService.createLinearChart()');
        const kunden = await this.find();
        const kundenGueltig = kunden.filter(
            k => k._id !== undefined && k.kategorie !== undefined,
        );

        const labels = kundenGueltig
            .map(k => k._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('KundeService.createLinearChart(): labels:', labels);

        const data = kundenGueltig.map(k => k.kategorie);
        const datasets: Array<ChartDataSets> = [{ label: 'Kategorie', data }];

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
        console.log('KundeService.createPieChart()');
        const kunden = await this.find();
        const kundenGueltig = kunden.filter(
            k => k._id !== undefined && k.kategorie !== undefined,
        );

        const labels = kundenGueltig
            .map(k => k._id)
            .map(id => (id === undefined ? '?' : id)); // eslint-disable-line no-extra-parens
        console.log('KundeService.createPieChart(): labels:', labels);

        const kategorien = kundenGueltig.map(k => k.kategorie);
        const backgroundColor: Array<ChartColor> = [];
        const hoverBackgroundColor: Array<ChartColor> = [];
        for (let i = 0; i < kategorien.length; i++) {
            backgroundColor.push(this.diagrammService.getBackgroundColor(i));
            hoverBackgroundColor.push(
                this.diagrammService.getHoverBackgroundColor(i),
            );
        }

        const data: ChartData = {
            labels,
            datasets: [
                {
                    data: kategorien,
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
            'KundeService.suchkriterienToHttpParams(): suchkriterien=',
            suchkriterien,
        );
        let httpParams = new HttpParams();

        if (suchkriterien === undefined) {
            return httpParams;
        }

        const {
            nachname,
            familienstand,
            geschlecht,
            interessen,
        } = suchkriterien;
        const { lesen, reisen, sport } = interessen;

        if (nachname !== '') {
            httpParams = httpParams.set('nachname', nachname);
        }
        if (geschlecht !== '') {
            httpParams = httpParams.set('geschlecht', geschlecht);
        }
        if (familienstand !== '') {
            httpParams = httpParams.set('familienstand', familienstand);
        }
        if (lesen) {
            httpParams = httpParams.set('lesen', 'true');
        }
        if (reisen) {
            httpParams = httpParams.set('reisen', 'true');
        }
        if (sport) {
            httpParams = httpParams.set('reisen', 'true');
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
            `KundeService.buildFindError(): status=${status}, Response-Body=${error}`,
        );
        return new FindError(status, error, err);
    }
}
/* eslint-enable no-underscore-dangle */

export interface Suchkriterien {
    nachname: string;
    familienstand: Familienstand | '';
    geschlecht: Geschlecht | '';
    interessen: { lesen: boolean; reisen: boolean; sport: boolean };
}
/* eslint-enable max-lines,no-null/no-null */
