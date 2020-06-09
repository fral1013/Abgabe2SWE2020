import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { UpdateGeschlechtComponent } from './update-geschlecht.component';

@NgModule({
    declarations: [UpdateGeschlechtComponent],
    exports: [UpdateGeschlechtComponent],
    imports: [ReactiveFormsModule],
})
export class UpdateGeschlechtModule {}
