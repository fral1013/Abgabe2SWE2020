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
import { FormControl, FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';

/**
 * Komponente mit dem Tag &lt;hs-create-kategorie&gt;, um das Erfassungsformular
 * f&uuml;r ein neuen Kunden zu realisieren.
 */
@Component({
    selector: 'hs-create-kategorie',
    templateUrl: './create-kategorie.component.html',
})
export class CreateKategorieComponent implements OnInit {
    @Input()
    readonly form!: FormGroup;

    readonly kategorie = new FormControl(undefined);

    ngOnInit() {
        console.log('CreateKategorieComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('kategorie', this.kategorie);
    }
}
