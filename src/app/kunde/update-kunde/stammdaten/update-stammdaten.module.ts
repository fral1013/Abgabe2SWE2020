import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateGeschlechtModule } from './update-geschlecht.module';
import { UpdateNachnameModule } from './update-nachname.module';
import { UpdateKategorieModule } from './update-kategorie.module';
import { UpdateStammdatenComponent } from './update-stammdaten.component';
import { UpdateVerlagModule } from './update-verlag.module';

@NgModule({
    declarations: [UpdateStammdatenComponent],
    exports: [UpdateStammdatenComponent],
    imports: [
        ReactiveFormsModule,
        UpdateGeschlechtModule,
        UpdateKategorieModule,
        UpdateNachnameModule,
        UpdateFamilienstandModule,
    ],
})
export class UpdateStammdatenModule {}
