import type { KundeGeschlecht } from '../../shared/kunde';
import { Component } from '@angular/core';
import { fadeIn } from '../../../shared';

@Component({
    selector: 'hs-suche-geschlecht',
    templateUrl: './suche-geschlecht.component.html',
    animations: [fadeIn],
})
export class SucheGeschlechtComponent {
    geschlecht: KundeGeschlecht | '' = '';

    constructor() {
        console.log('SucheGeschlechtComponent.constructor()');
    }
}
