import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  static usernamePattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const errors: ValidationErrors = {};
      if (!value) {
        return null;
      }

      if (!/^[A-Za-z0-9]+$/.test(value)) {
        errors['usernamePattern'] = { message: "L'username può contenere solo lettere e numeri, senza spazi o simboli." };
      }

      if (!/[A-Za-z]/.test(value)) {
        errors['usernameNeedsLetter'] = { message: "L'username deve contenere almeno una lettera." };
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const errors: ValidationErrors = {};

      if (!value) {
        return null;
      }

      if (!/[a-z]/.test(value)) {
        errors['passwordNeedsLowercase'] = { message: "La password deve contenere almeno una lettera minuscola." };
      }

      if (!/[A-Z]/.test(value)) {
        errors['passwordNeedsUppercase'] = { message: "La password deve contenere almeno una lettera maiuscola." };
      }

      if (!/\d/.test(value)) {
        errors['passwordNeedsNumber'] = { message: "La password deve contenere almeno un numero." };
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static tagsPattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) {
        return null;
      }

      const tags = value.split(',').map(tag => tag.trim());
      const alphanumericWithSpacesPattern = /^[a-zA-Z0-9\s]+$/; 

      for (const tag of tags) {
        if (tag === '') {
          continue; 
        }
        if (!alphanumericWithSpacesPattern.test(tag)) {
          return { 
            tagsPattern: { 
              message: `Un tag non è valido. Usa solo lettere, numeri e spazi.`,
              invalidTag: tag 
            }
          };
        }
      }

      return null;
    };
  }
}