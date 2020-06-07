import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateGeschlechtModule } from './update-geschlecht.module';
import { UpdateNachnameModule } from './update-nachname.module';
import { UpdateFamilienstandModule } from './update-famlienstand.module';
import { UpdateKategorieModule } from './update-kategorie.module';
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
