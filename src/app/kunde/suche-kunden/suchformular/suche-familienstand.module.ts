import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SucheFamilienstandComponent } from './suche-familienstand.component';

@NgModule({
    declarations: [SucheFamilienstandComponent],
    exports: [SucheFamilienstandComponent],
    imports: [FormsModule],
})
export class SucheFamilienstandModule {}
