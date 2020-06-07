import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SucheNachnameComponent } from './suche-nachname.component';

@NgModule({
    declarations: [SucheNachnameComponent],
    exports: [SucheNachnameComponent],
    imports: [FormsModule],
})
export class SucheNachnameModule {}
