import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function maxTagsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tags = (control.value || '').split(',').filter((tag: string) => tag.trim() !== '');
    return tags.length > max ? { 'maxTags': { requiredCount: max, actualCount: tags.length } } : null;
  };
}