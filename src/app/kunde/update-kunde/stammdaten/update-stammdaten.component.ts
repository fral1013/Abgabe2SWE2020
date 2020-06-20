import { Component, Input } from '@angular/core';
import { Kunde, KundeService } from '../../shared';
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
    @Input()
    readonly kunde!: Kunde;

    readonly form = new FormGroup({});

    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
    ) {
        console.log('UpdateStammdatenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Stammdaten des zu &auml;ndernden Kundes vorbelegen.
     */
    ngOnInit() {
        console.log('UpdateStammdatenComponent.ngOnInit(): kunde=', this.kunde);
    }

    /**
     * Die aktuellen Stammdaten f&uuml;r das angezeigte Kunde-Objekt
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

        if (this.kunde === undefined) {
            console.error(
                'UpdateStammdatenComponent.onUpdate(): kunde === undefined',
            );
            return;
        }

        // rating, preis und rabatt koennen im Formular nicht geaendert werden
        // nachname: string,
        // familienstand: Familienstand,
        // email: string,
        // homepage: string,
        // kategorie: number | undefined,
        // newsletter: boolean,
        this.kunde.updateStammdaten(
            this.form.value.nachname,
            this.form.value.geschlecht,
            this.form.value.familienstand,
            this.form.value.kategorie,
            // this.form.value.familienstand,
        );
        console.log('kunde=', this.kunde);

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

        await this.kundeService.update(this.kunde, successFn, errorFn);

        return false;
    }
}
