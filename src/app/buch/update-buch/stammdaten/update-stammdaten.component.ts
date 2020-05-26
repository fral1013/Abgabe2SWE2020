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

import { Buch, BuchService } from '../../shared';
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HOME_PATH } from '../../../shared';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-stammdaten</code>
 */
@Component({
    selector: 'hs-update-stammdaten',
    templateUrl: './update-stammdaten.component.html',
})
export class UpdateStammdatenComponent implements OnInit {
    // <hs-update-stammdaten [buch]="...">
    @Input()
    readonly buch!: Buch;

    readonly form = new FormGroup({});

    constructor(
        private readonly buchService: BuchService,
        private readonly router: Router,
    ) {
        console.log('UpdateStammdatenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Stammdaten des zu &auml;ndernden Buchs vorbelegen.
     */
    ngOnInit() {
        console.log('UpdateStammdatenComponent.ngOnInit(): buch=', this.buch);
    }

    /**
     * Die aktuellen Stammdaten f&uuml;r das angezeigte Buch-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    async onUpdate() {
        if (this.form.pristine) {
            console.log(
                'UpdateStammdatenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        if (this.buch === undefined) {
            console.error(
                'UpdateStammdatenComponent.onUpdate(): buch === undefined',
            );
            return;
        }

        // rating, preis und rabatt koennen im Formular nicht geaendert werden
        this.buch.updateStammdaten(
            this.form.value.titel,
            this.form.value.art,
            this.form.value.verlag,
            this.form.value.rating,
            this.buch.datum,
            this.buch.preis,
            this.buch.rabatt,
            this.form.value.isbn,
        );
        console.log('buch=', this.buch);

        const successFn = async () => {
            console.log(
                `UpdateStammdaten.onUpdate(): successFn: path: ${HOME_PATH}`,
            );
            await this.router.navigate([HOME_PATH]);
        };

        const errorFn: (
            status: number,
            errors: { [s: string]: unknown } | undefined,
        ) => void = (status, errors?) => {
            console.error(
                `UpdateStammdatenComponent.onUpdate(): errorFn(): status: ${status}, errors=`,
                errors,
            );
            // TODO Fehlermeldung anzeigen
        };

        await this.buchService.update(this.buch, successFn, errorFn);

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }
}
