import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SucheGeschlechtComponent } from './suche-geschlecht.component';

@NgModule({
    declarations: [SucheGeschlechtComponent],
    exports: [SucheGeschlechtComponent],
    imports: [FormsModule],
})
export class SucheGeschlechtModule {}
