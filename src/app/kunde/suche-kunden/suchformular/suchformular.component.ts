import { Component, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SucheFamilienstandComponent } from './suche-familienstand.component';
import { SucheGeschlechtComponent } from './suche-geschlecht.component';
import { SucheInteressenComponent } from './suche-interessen.component';
import { SucheNachnameComponent } from './suche-nachname.component';
import type { Suchkriterien } from '../../shared/types';
import { fadeIn } from '../../../shared';

/**
 * Komponente f&uuml;r das Tag <code>hs-suchformular</code>
 */
@Component({
    selector: 'hs-suchformular',
    templateUrl: './suchformular.component.html',
    animations: [fadeIn],
})
export class SuchformularComponent {
    // Event Binding: <hs-suchformular (waiting)="...">
    // in RxJS: Observables = Event-Streaming mit Promises
    // Subject statt der Basisklasse Observable, damit next() in onFind() aufgerufen werden kann
    // https://angular.io/guide/component-interaction#parent-listens-for-child-event
    @Output()
    readonly suchkriterien = new Subject<Suchkriterien>();

    // DI der Child-Komponente, um auf deren Attribut (hier: "titel") zuzugreifen
    // @Output in SucheTitelComponent wuerde Subject<> erfordern
    // https://angular.io/guide/component-interaction#parent-calls-an-viewchild
    // query results available in ngOnInit
    @ViewChild(SucheNachnameComponent, { static: true })
    private readonly sucheNachnameComponent!: SucheNachnameComponent;

    @ViewChild(SucheFamilienstandComponent, { static: true })
    private readonly sucheFamilienstandComponent!: SucheFamilienstandComponent;

    @ViewChild(SucheGeschlechtComponent, { static: true })
    private readonly sucheGeschlechtComponent!: SucheGeschlechtComponent;

    @ViewChild(SucheInteressenComponent, { static: true })
    private readonly sucheInteressenComponent!: SucheInteressenComponent;

    // DI: Constructor Injection (React hat uebrigens keine DI)
    // Empfehlung: Konstruktor nur fuer DI
    constructor() {
        console.log('SuchformularComponent.constructor()');
    }

    /**
     * Suche nach Kunden, den spezfizierten Suchkriterien entsprechend
     * @return false
     */
    onFind() {
        const { nachname } = this.sucheNachnameComponent;
        const { familienstand } = this.sucheFamilienstandComponent;
        const { geschlecht } = this.sucheGeschlechtComponent;
        const { lesen } = this.sucheInteressenComponent;
        const { reisen } = this.sucheInteressenComponent;
        const { sport } = this.sucheInteressenComponent;

        console.log(
            `SuchformularComponent.onFind(): nachname=${nachname}, familienstand=${familienstand}, geschlecht=${geschlecht}, lesen=${lesen}, reisen=${reisen}, sport=${sport}`,
        );

        this.suchkriterien.next({
            nachname,
            familienstand,
            geschlecht,
            interessen: { lesen, reisen, sport },
        });

        return false;
    }
}
