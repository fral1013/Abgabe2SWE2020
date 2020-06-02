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

import { ActivatedRoute, Params } from '@angular/router';
import { Kunde, KundeService } from '../shared';
import type { OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Component } from '@angular/core';
import { FindError } from './../shared/errors';
import { HttpStatus } from '../../shared';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

/**
 * Komponente f&uuml;r das Tag <code>hs-details-kunde</code>
 */
@Component({
    selector: 'hs-details-kunde',
    templateUrl: './details-kunde.component.html',
})
export class DetailsKundeComponent implements OnInit, OnDestroy {
    waiting = true;

    kunde: Kunde | undefined;

    errorMsg: string | undefined;

    isAdmin!: boolean;

    private idParamSubscription!: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
        private readonly authService: AuthService,
    ) {
        console.log('DetailsKundeComponent.constructor()');
    }

    ngOnInit() {
        // Die Beobachtung starten, ob es einen Pfadparameter gibt, ohne dass
        // bisher ein JavaScript-Ereignis, wie z.B. click, eingetreten ist.
        this.idParamSubscription = this.subscribeIdParam();

        // Initialisierung, falls zwischenzeitlich der Browser geschlossen wurde
        this.isAdmin = this.authService.isAdmin;
    }

    ngOnDestroy() {
        this.idParamSubscription.unsubscribe();
    }

    private subscribeIdParam() {
        // Pfad-Parameter aus /kunden/:id
        // UUID (oder Mongo-ID) ist ein String

        // next-Function fuer Observable
        const next = (params: Params) => {
            console.log(
                'DetailsKundeComponent.subscribeIdParam(): params=',
                params,
            );

            // IIFE (= Immediately Invoked Function Expression) statt async Function
            // https://developer.mozilla.org/en-US/docs/Glossary/IIFE
            // https://github.com/typescript-eslint/typescript-eslint/issues/647
            // https://github.com/typescript-eslint/typescript-eslint/pull/1799
            (async () => {
                try {
                    this.kunde = await this.kundeService.findById(params.id);
                } catch (err) {
                    this.handleError(err);
                    return;
                } finally {
                    this.waiting = false;
                }

                this.errorMsg = undefined;
                const titel =
                    this.kunde === undefined
                        ? 'Details'
                        : `Details ${this.kunde._id}`;
                this.titleService.setTitle(titel);
            })();
        };

        // ActivatedRoute.params ist ein Observable
        return this.route.params.subscribe(next);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        console.log(`DetailsComponent.handleError(): statuscode=${statuscode}`);

        this.kunde = undefined;

        switch (statuscode) {
            case HttpStatus.NOT_FOUND:
                this.errorMsg = 'Kein Kunde gefunden.';
                break;
            case HttpStatus.TOO_MANY_REQUESTS:
                this.errorMsg =
                    'Zu viele Anfragen. Bitte versuchen Sie es später noch einmal.';
                break;
            case HttpStatus.GATEWAY_TIMEOUT:
                this.errorMsg = 'Ein interner Fehler ist aufgetreten.';
                console.error('Laeuft der Appserver?');
                break;
            default:
                this.errorMsg = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
        }

        this.titleService.setTitle('Fehler');
    }
}
