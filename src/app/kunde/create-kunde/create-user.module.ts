import { CreateUserComponent } from './create-user.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [CreateUserComponent],
    exports: [CreateUserComponent],
    imports: [ReactiveFormsModule],
})
export class CreateUserModule {}
