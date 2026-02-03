import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AppValidators {
    static passwordMatch(controlName: string, matchingControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const controlInput = control.get(controlName);
            const matchingControlInput = control.get(matchingControlName);

            if (controlInput && matchingControlInput && controlInput.value !== matchingControlInput.value) {
                matchingControlInput.setErrors({ passwordMismatch: true });
                return { passwordMismatch: true };
            }
            return null;
        };
    }
}
