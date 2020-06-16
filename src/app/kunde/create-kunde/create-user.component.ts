import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Komponente mit dem Tag &lt;hs-create-user&gt;, um das Erfassungsformular
 * f&uuml;r einen neuen Kunden zu realisieren.
 */
@Component({
    selector: 'hs-create-user',
    templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit {
    @Input()
    readonly form!: FormGroup;

    user: object;

    readonly username = new FormControl(undefined, Validators.required);

    readonly passwort = new FormControl(undefined, Validators.required);

    ngOnInit() {
        console.log('CreateUserComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('username', this.username);
        this.form.addControl('passwort', this.passwort);
    }
}
