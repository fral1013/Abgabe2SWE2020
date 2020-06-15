/* eslint-disable max-classes-per-file */

// Bereitgestellt durch das RouterModule
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { HttpStatus, easeIn, easeOut } from '../../../shared';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { FindError, Kunde, KundeService, RemoveError } from '../../shared';
import { NgLocalization } from '@angular/common';
import type { Suchkriterien } from '../../shared/types';

/**
 * Komponente f&uuml;r das Tag <code>hs-suchergebnis</code>, um zun&auml;chst
 * das Warten und danach das Ergebnis der Suche anzuzeigen, d.h. die gefundenen
 * Kunden oder eine Fehlermeldung.
 */
@Component({
    selector: 'hs-suchergebnis',
    templateUrl: './suchergebnis.component.html',
    animations: [easeIn, easeOut],
})
export class SuchergebnisComponent implements OnChanges, OnInit {
    // Im ganzen Beispiel: lokale Speicherung des Zustands und nicht durch z.B.
    // eine Flux-Bibliothek, wie z.B. Redux http://redux.js.org

    // Property Binding: <hs-suchergebnis [waiting]="...">
    // Decorator fuer ein Attribut. Siehe InputMetadata
    @Input()
    suchkriterien: Suchkriterien | undefined;

    waiting = false;

    kunden: Array<Kunde> = [];

    errorMsg: string | undefined;

    isAdmin!: boolean;

    // Empfehlung: Konstruktor nur fuer DI
    // eslint-disable-next-line max-params
    constructor(
        private readonly kundeService: KundeService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly authService: AuthService,
    ) {
        console.log('SuchergebnisComponent.constructor()');
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.suchkriterien.currentValue === undefined) {
            return;
        }

        this.waiting = true;

        try {
            // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            this.kunden = await this.kundeService.find(this.suchkriterien);
        } catch (err) {
            this.handleFindError(err);
            return;
        } finally {
            this.waiting = false;
        }

        console.log(
            'SuchergebnisComponent.ngOnChanges(): kunden=',
            this.kunden,
        );
    }

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin;
    }

    onClick(kunde: Kunde) {
        console.log('SuchergebnisComponent.onClick(): kunde=', kunde);
        this.kundeService.kunde = kunde;
        return this.router.navigate(['..', kunde._id], {
            relativeTo: this.route,
        });
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Kunde l&ouml;schen.
     * @param kunde Das ausgew&auml;hlte Kunde
     */
    async onRemove(kunde: Kunde) {
        console.log('SuchergebnisComponent.onRemove(): kunde=', kunde);

        try {
            await this.kundeService.remove(kunde);
        } catch (err) {
            this.handleRemoveError(err);
            return;
        }

        if (this.kunden.length > 0) {
            this.kunden = this.kunden.filter((b: Kunde) => b._id !== kunde._id);
        }
    }

    private handleFindError(err: FindError) {
        const { statuscode } = err;
        console.log(
            `SuchErgebnisComponent.handleFindError(): statuscode=${statuscode}`,
        );
        this.reset();

        switch (statuscode) {
            case HttpStatus.NOT_FOUND:
                this.errorMsg = 'Keine Kunden gefunden.';
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

        console.log(
            `SuchErgebnisComponent.handleFindError(): errorMsg=${this.errorMsg}`,
        );
    }

    private reset() {
        this.suchkriterien = {
            nachname: '',
            familienstand: '',
            geschlecht: '',
            interessen: { lesen: false, reisen: false, sport: false },
        };

        this.kunden = [];
        this.waiting = false;
    }

    private handleRemoveError(err: RemoveError) {
        console.error(
            `SuchergebnisComponent.onRemove(): statuscode=${err.statuscode}`,
        );
    }
}

export class AnzahlLocalization extends NgLocalization {
    getPluralCategory(count: number) {
        return count === 1 ? 'single' : 'multi';
    }
}
