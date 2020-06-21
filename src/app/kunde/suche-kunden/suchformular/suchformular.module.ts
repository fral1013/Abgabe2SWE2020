import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { SucheFamilienstandModule } from './suche-familienstand.module';
import { SucheGeschlechtModule } from './suche-geschlecht.module';
import { SucheInteressenModule } from './suche-interessen.module';
import { SucheNachnameModule } from './suche-nachname.module';
import { SuchformularComponent } from './suchformular.component';

@NgModule({
    declarations: [SuchformularComponent],
    exports: [SuchformularComponent],
    imports: [
        HttpClientModule,
        FormsModule,
        SucheGeschlechtModule,
        SucheInteressenModule,
        SucheNachnameModule,
        SucheFamilienstandModule,
    ],
})
export class SuchformularModule {}
