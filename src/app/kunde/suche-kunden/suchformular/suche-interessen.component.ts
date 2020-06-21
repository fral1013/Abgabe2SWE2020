import { Component } from '@angular/core';

/**
 * Komponente f&uuml;r das Tag <code>hs-suche-schlagwoerter</code>
 */
@Component({
    selector: 'hs-suche-interessen',
    templateUrl: './suche-interessen.component.html',
})
export class SucheInteressenComponent {
    lesen = false;

    reisen = false;

    sport = false;

    constructor() {
        console.log('SucheInteressenComponent.constructor()');
    }
}
