import { Component } from '@angular/core';

import type { Verlag } from '../../shared/kunde';

/**
 * Komponente f&uuml;r das Tag <code>hs-suche-familienstand</code>
 */
@Component({
    selector: 'hs-suche-familienstand',
    templateUrl: './suche-familienstand.component.html',
})
export class SucheFamilienstandComponent {
    familienstand: Familienstand | '' = '';

    constructor() {
        console.log('SucheFamilienstandComponent.constructor()');
    }
}
