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

import { Component, Input } from '@angular/core';
import type { Familienstand } from '../../shared/kunde';
import type { OnInit } from '@angular/core';

/**
 * Komponente f&uuml;r das Tag <code>hs-details-familienstand</code>
 */
@Component({
    selector: 'hs-details-familienstand',
    templateUrl: './details-familienstand.component.html',
})
export class DetailsFamilienstandComponent implements OnInit {
    @Input()
    readonly familienstand: Familienstand | undefined | '';

    ngOnInit() {
        console.log(
            `DetailsFamilienstandComponent.familienstand=${this.familienstand}`,
        );
    }
}
