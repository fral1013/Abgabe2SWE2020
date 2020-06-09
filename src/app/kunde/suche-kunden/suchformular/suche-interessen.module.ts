import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SucheInteressenComponent } from './suche-interessen.component';

@NgModule({
    declarations: [SucheInteressenComponent],
    exports: [SucheInteressenComponent],
    imports: [FormsModule],
})
export class SucheInteressenModule {}
