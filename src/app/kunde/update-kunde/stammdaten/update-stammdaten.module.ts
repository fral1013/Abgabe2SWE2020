import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateFamilienstandModule } from './update-familienstand.module';
import { UpdateGeschlechtModule } from './update-geschlecht.module';
import { UpdateKategorieModule } from './update-kategorie.module';
import { UpdateNachnameModule } from './update-nachname.module';
import { UpdateStammdatenComponent } from './update-stammdaten.component';

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
