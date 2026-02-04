import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @class AppValidators
 * @description
 * Clase utilitaria que contiene validadores personalizados (custom validators) para formularios de Angular.
 * Los validadores estáticos se pueden usar directamente en FormGroups sin necesidad de instanciar la clase.
 * 
 * **¿QUÉ ES UN CUSTOM VALIDATOR?**
 * Angular proporciona validadores básicos (required, email, minLength, etc.),
 * pero a veces necesitamos validaciones específicas del negocio (ej: contraseñas coincidentes).
 * Los custom validators son funciones que implementan lógica de validación personalizada.
 * 
 * **USO:**
 * Se aplican en el FormGroup mediante el tercer parámetro (validators de grupo):
 * ```typescript
 * this.form = this.fb.group({
 *   password: ['', Validators.required],
 *   confirmPassword: ['', Validators.required]
 * }, {
 *   validators: [AppValidators.passwordMatch('password', 'confirmPassword')]
 * });
 * ```
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export class AppValidators {
    /**
     * @method passwordMatch
     * @description
     * Validador personalizado que verifica que dos campos de contraseña coincidan.
     * Se usa típicamente en formularios de registro o cambio de contraseña.
     * 
     * **¿CÓMO FUNCIONA?**
     * 1. Recibe los nombres de dos controles (ej: 'password' y 'confirmPassword')
     * 2. Retorna una función ValidatorFn que Angular ejecuta en cada cambio del formulario
     * 3. La función obtiene ambos controles mediante control.get(name)
     * 4. Compara los valores de ambos controles
     * 5. Si NO coinciden, establece error { passwordMismatch: true } en el segundo control
     * 6. Retorna ValidationErrors si hay error, o null si todo está correcto
     * 
     * **PATRÓN DE VALIDACIÓN A NIVEL DE GRUPO:**
     * Este validador se aplica al FormGroup (no a controles individuales) porque necesita
     * acceder a dos controles simultáneamente. Es un "group-level validator".
     * 
     * **IMPORTANTE - SIDE EFFECT:**
     * Además de retornar el error, también establece el error directamente en el control
     * mediante matchingControlInput.setErrors({ passwordMismatch: true }).
     * Esto permite que el mensaje de error se muestre junto al campo confirmPassword.
     * 
     * **LIMITACIÓN:**
     * Si el segundo control tiene otros errores (ej: required), setErrors() los sobrescribirá.
     * Una mejora sería usar updateValueAndValidity() o preservar errores existentes.
     * 
     * @param {string} controlName - Nombre del control con la contraseña original (ej: 'password')
     * @param {string} matchingControlName - Nombre del control con la confirmación (ej: 'confirmPassword')
     * @returns {ValidatorFn} Función validadora que Angular ejecutará en cada cambio del formulario
     * 
     * @example
     * // En register.page.ts:
     * this.registerForm = this.fb.group({
     *   email: ['', [Validators.required, Validators.email]],
     *   password: ['', [Validators.required, Validators.minLength(6)]],
     *   confirmPassword: ['', Validators.required]
     * }, {
     *   validators: [AppValidators.passwordMatch('password', 'confirmPassword')]
     * });
     * 
     * @example
     * // En el template (register.page.html):
     * <ion-input formControlName="confirmPassword"></ion-input>
     * <ion-text color="danger" *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
     *   Las contraseñas no coinciden
     * </ion-text>
     * 
     * @see {@link https://angular.io/guide/form-validation#custom-validators|Angular Custom Validators}
     */
    static passwordMatch(controlName: string, matchingControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // Obtener referencia a los dos controles mediante sus nombres
            const controlInput = control.get(controlName);
            const matchingControlInput = control.get(matchingControlName);

            // Validar que ambos controles existan y que sus valores NO coincidan
            if (controlInput && matchingControlInput && controlInput.value !== matchingControlInput.value) {
                // SIDE EFFECT: Establecer error directamente en el control de confirmación
                // Esto permite mostrar el mensaje de error junto al campo confirmPassword
                matchingControlInput.setErrors({ passwordMismatch: true });
                
                // Retornar error a nivel de grupo (también importante para form.invalid)
                return { passwordMismatch: true };
            }
            
            // Si coinciden o algún control no existe, no hay error
            return null;
        };
    }
}
