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

import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Kunde, KundeService } from '../../shared';
import { HOME_PATH } from '../../../shared';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Komponente f&uuml;r das Tag <code>hs-</code>
 */
@Component({
    selector: 'hs-update-interessen',
    templateUrl: './update-interessen.component.html',
})
export class UpdateInteressenComponent implements OnInit {
    // <hs-update-interessen [buch]="...">
    @Input()
    readonly kunde!: Kunde;

    form!: FormGroup;

    lesen!: FormControl;

    reisen!: FormControl;

    sport!: FormControl;

    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
    ) {
        console.log('UpdateInteresseComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Interessenn des zu &auml;ndernden Kunden vorbelegen.
     */
    ngOnInit() {
        console.log('kunde=', this.kunde);

        // Definition und Vorbelegung der Eingabedaten (hier: Checkbox)
        const hasLesen = this.kunde.hasInteresse('L');
        this.lesen = new FormControl(hasLesen);
        const hasReisen = this.kunde.hasInteresse('R');
        this.reisen = new FormControl(hasReisen);
        const hasSport = this.kunde.hasInteresse('S');
        this.sport = new FormControl(hasSport);

        this.form = new FormGroup({
            // siehe ngFormControl innerhalb von @Component({template: `...`})
            lesen: this.lesen,
            reisen: this.reisen,
            sport: this.sport,
        });
    }

    /**
     * Die aktuellen Interessen fuer das angezeigte Kunde-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    async onUpdate() {
        if (this.form.pristine) {
            console.log(
                'UpdateInteressenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        if (this.kunde === undefined) {
            console.error(
                'UpdateInteressenComponent.onUpdate(): kunde === undefined',
            );
            return;
        }

        this.kunde.updateInteressen(
            this.lesen.value,
            this.reisen.value,
            this.sport.value,
        );
        console.log('kunde=', this.kunde);

        const successFn = async () => {
            console.log(
                `UpdateInteressenComponent.onUpdate(): successFn: path: ${HOME_PATH}`,
            );
            await this.router.navigate([HOME_PATH]);
        };

        const errorFn: (
            status: number,
            errors: { [s: string]: unknown } | undefined,
        ) => void = (status, errors?) => {
            console.error(
                `UpdateInteressenComponent.onUpdate(): errorFn(): status: ${status}, errors=`,
                errors,
            );
            // TODO Fehlermeldung anzeigen
        };

        await this.kundeService.update(this.kunde, successFn, errorFn);

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }
}
