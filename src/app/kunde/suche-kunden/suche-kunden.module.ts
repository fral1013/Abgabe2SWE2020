import { NgModule } from '@angular/core';
import { SucheKundenComponent } from './suche-kunden.component';
import { SuchergebnisModule } from './suchergebnis/suchergebnis.module';
import { SuchformularModule } from './suchformular/suchformular.module';
import { Title } from '@angular/platform-browser';

@NgModule({
    declarations: [SucheKundenComponent],
    exports: [SucheKundenComponent],
    imports: [SuchergebnisModule, SuchformularModule],
    providers: [Title],
})
export class SucheKundenModule {}
