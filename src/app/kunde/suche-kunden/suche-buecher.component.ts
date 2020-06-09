import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import type { Suchkriterien } from '../shared/types';
import { Title } from '@angular/platform-browser';

/**
 * <ul>
 *  <li> <code>hs-suchformular</code>
 *  <li> <code>hs-suchergebnis</code>
 * </ul>
 */
@Component({
    selector: 'hs-suche-kunden',
    templateUrl: './suche-kunden.component.html',
})
export class SucheKundenComponent implements OnInit {
    suchkriterien!: Suchkriterien;

    constructor(private readonly titleService: Title) {
        console.log('SucheKundenComponent.constructor()');
    }

    ngOnInit() {
        this.titleService.setTitle('Suche');
    }

    /**
     * Das Attribut <code>suchkriterien</code> wird auf den Wert des Ereignisses
     * <code>$event</code> vom Typ Suchkriteriengesetzt. Diese Methode wird
     * aufgerufen, wenn in der Kindkomponente f&uuml;r
     * <code>hs-suchformular</code> das Ereignis ausgel&ouml;st wird.
     * Der aktuelle Wert vom Attribut <code>&lt;suchkriterien&gt;</code> an die
     * Kindkomponente f&uuml;r <code>&lt;suchergebnis&gt;</code> weitergereicht.
     * @param $event true f&uuml;r das Ausl&ouml;sen der Suche.
     */
    setSuchkriterien($event: Suchkriterien) {
        console.log(
            'SucheKundenComponent.setSuchkriterien(): suchkriterien=',
            $event,
        );
        this.suchkriterien = $event;
    }
}
