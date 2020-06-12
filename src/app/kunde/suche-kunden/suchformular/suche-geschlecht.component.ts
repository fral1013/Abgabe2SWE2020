import { Component } from '@angular/core';
import type { Geschlecht } from '../../shared/kunde';
import { fadeIn } from '../../../shared';

@Component({
    selector: 'hs-suche-geschlecht',
    templateUrl: './suche-geschlecht.component.html',
    animations: [fadeIn],
})
export class SucheGeschlechtComponent {
    geschlecht: Geschlecht | '' = '';

    constructor() {
        console.log('SucheGeschlechtComponent.constructor()');
    }
}
