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
import { FindError, Kunde, KundeService } from '../shared';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { HttpStatus } from '../../shared';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-kunde</code> mit Kindkomponenten
 * f&uuml;r die folgenden Tags:
 * <ul>
 *  <li> <code>hs-stammdaten</code>
 *  <li> <code>hs-schlagwoerter</code>
 * </ul>
 */
@Component({
    selector: 'hs-update-kunde',
    templateUrl: './update-kunde.component.html',
})
export class UpdateKundeComponent implements OnInit, OnDestroy {
    kunde: Kunde | undefined;

    errorMsg: string | undefined;

    private idParamSubscription!: Subscription;

    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
    ) {
        console.log('UpdateKundeComponent.constructor()');
    }

    ngOnInit() {
        // Observable fuer Pfad-Parameter aus /buecher/:id/update
        this.idParamSubscription = this.subscribeIdParam();

        this.titleService.setTitle('Aktualisieren');
    }

    ngOnDestroy() {
        this.idParamSubscription.unsubscribe();
    }

    private subscribeIdParam() {
        const next = (params: Params) => {
            console.log('params=', params);
            (async () => {
                try {
                    this.kunde = await this.kundeService.findById(params.id);
                } catch (err) {
                    this.handleError(err);
                }
            })();
        };

        // ActivatedRoute.params ist ein Observable
        return this.route.params.subscribe(next);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        console.log(
            `UpdateKundeComponent.handleError(): statuscode=${statuscode}`,
        );

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
    }
}
