import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function alphanumericTagsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tags = (control.value || '').split(',').map((tag: string) => tag.trim());
    const invalidTagPattern = /[^a-z0-9]/i;
    const invalidTags = tags.filter((tag: string) => invalidTagPattern.test(tag));
    
    return invalidTags.length > 0 ? { 'alphanumericTags': { invalidTags: invalidTags } } : null;
  };
}