import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function containsNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasNumber = /[0-9]/.test(control.value);
      return !hasNumber ? { missingNumber: true } : null;
    };
}