import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SucheArtComponent } from './suche-geschlecht.component';

@NgModule({
    declarations: [SucheGeschlechtComponent],
    exports: [SucheGeschlechtComponent],
    imports: [FormsModule],
})
export class SucheGeschlechtModule {}
