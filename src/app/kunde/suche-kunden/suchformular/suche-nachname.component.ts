import { Component } from '@angular/core';

/**
 * Komponente f&uuml;r das Tag <code>hs-suche-titel</code>
 */
@Component({
    selector: 'hs-suche-nachname',
    templateUrl: './suche-nachname.component.html',
})
export class SucheNachnameComponent {
    nachname = '';

    constructor() {
        console.log('SucheNachnameComponent.constructor()');
    }
}
