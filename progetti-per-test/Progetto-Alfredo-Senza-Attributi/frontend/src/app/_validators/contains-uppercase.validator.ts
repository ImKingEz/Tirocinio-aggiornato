import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function containsUppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasUppercase = /[A-Z]/.test(control.value);
      return !hasUppercase ? { missingUppercase: true } : null;
    };
}