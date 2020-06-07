import { CommonModule } from '@angular/common';
import { ErrorMessageModule } from '../../../shared/error-message.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SuchergebnisComponent } from './suchergebnis.component';
import { WaitingModule } from '../../../shared/waiting.module';

@NgModule({
    declarations: [SuchergebnisComponent],
    exports: [SuchergebnisComponent],
    imports: [CommonModule, RouterModule, ErrorMessageModule, WaitingModule],
})
export class SuchergebnisModule {}
