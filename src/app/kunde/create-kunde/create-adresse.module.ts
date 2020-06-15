import { CreateAdresseComponent } from './create-adresse.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [CreateAdresseComponent],
    exports: [CreateAdresseComponent],
    imports: [ReactiveFormsModule],
})
export class CreateAdresseModule {}
