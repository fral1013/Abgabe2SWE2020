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

import { Component, ElementRef, ViewChild } from '@angular/core';
import type { AfterViewInit } from '@angular/core';
import { KundeService } from '../shared';
import { Title } from '@angular/platform-browser';

/**
 * Komponente mit dem Tag &lt;hs-balkendiagramm&gt; zur Visualisierung
 * von Kategorien durch ein Balkendiagramm.
 * https://blog.angular-university.io/angular-viewchild
 */
@Component({
    selector: 'hs-balkendiagramm',
    templateUrl: './diagramm.html',
})
export class BalkendiagrammComponent implements AfterViewInit {
    // query results available in ngAfterViewInit
    @ViewChild('chartCanvas', { static: false })
    chartCanvas!: ElementRef<HTMLCanvasElement>;

    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
    ) {
        console.log('BalkendiagrammComponent.constructor()');
    }

    /**
     * Das Balkendiagramm beim Tag <code><canvas></code> einf&uuml;gen.
     * Erst in ngAfterViewInit kann auf ein Kind-Element aus dem Template
     * zugegriffen werden:
     * https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html.
     */
    async ngAfterViewInit() {
        await this.kundeService.createBarChart(this.chartCanvas.nativeElement);
        this.titleService.setTitle('Balkendiagramm');
    }
}
