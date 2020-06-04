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

import { HOME_PATH, HttpStatus } from '../../shared';
import { Kunde, KundeService, SaveError } from '../shared';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

/**
 * Komponente mit dem Tag &lt;create-buch&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-create-kunde',
    templateUrl: './create-kunde.component.html',
})
export class CreateKundeComponent implements OnInit {
    form = new FormGroup({});

    showWarning = false;

    fertig = false;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
        private readonly titleService: Title,
    ) {
        console.log('CreateKundeComponent.constructor()');
        if (router !== undefined) {
            console.log('Injizierter Router:', router);
        }
    }

    ngOnInit() {
        this.titleService.setTitle('Neuer Kunde');
    }

    /**
     * Die Methode <code>save</code> realisiert den Event-Handler, wenn das
     * Formular abgeschickt wird, um ein neues Buch anzulegen.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    async onSave() {
        // In einem Control oder in einer FormGroup gibt es u.a. folgende
        // Properties
        //    value     JSON-Objekt mit den IDs aus der FormGroup als
        //              Schluessel und den zugehoerigen Werten
        //    errors    Map<string,any> mit den Fehlern, z.B. {'required': true}
        //    valid/invalid     fuer valide Werte
        //    dirty/pristine    falls der Wert geaendert wurde

        if (this.form.invalid) {
            console.log(
                'CreateKundeComponent.onSave(): Validierungsfehler',
                this.form,
            );
            return false;
        }

        const neuerKunde = Kunde.fromForm(this.form.value);
        console.log('CreateKundeComponent.onSave(): neuerKunde=', neuerKunde);

        try {
            const id = await this.kundeService.save(neuerKunde);
            console.log(`CreateKundeComponent.onSave(): id=${id}`);
        } catch (err) {
            this.handleError(err);
            return;
        }

        this.fertig = true;
        this.showWarning = false;
        await this.router.navigate([HOME_PATH]);

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum Refresh
        // der gesamten Seite
        return false;
    }

    private handleError(err: SaveError) {
        const { statuscode } = err;
        console.log(
            `CreateKundeComponent.handleError(): statuscode=${statuscode}`,
        );

        switch (statuscode) {
            case HttpStatus.BAD_REQUEST:
                // TODO Aufbereitung der Fehlermeldung: u.a. Anfuehrungszeichen
                this.errorMsg = JSON.stringify(err.message);
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
