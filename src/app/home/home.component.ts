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

import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'hs-home',
    // https://next.angular.io/guide/i18n
    // https://angular.io/guide/i18n
    // https://github.com/angular/angular/tree/master/packages/common/locales
    // http://cldr.unicode.org
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    constructor(private readonly title: Title) {
        console.log('HomeComponent.constructor()');
    }

    ngOnInit() {
        this.title.setTitle('Abgabe2');
    }
}
