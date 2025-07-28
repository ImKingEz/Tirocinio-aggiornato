import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

export function imageRatioValidator(allowedRatios: number[], tolerance: number): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const file = control.value as File;

    if (!file || !(file instanceof File)) {
      return of(null);
    }

    return new Observable(observer => {
      const reader = new FileReader();
      const image = new Image();

      image.onload = () => {
        const aspectRatio = image.width / image.height;
        let isValid = false;

        for (const ratio of allowedRatios) {
          if (Math.abs(aspectRatio - ratio) <= tolerance) {
            isValid = true;
            break;
          }
        }

        if (isValid) {
          observer.next(null);
          observer.complete();
        } else {
          observer.next({ 'imageRatio': { requiredRatios: allowedRatios, actualRatio: aspectRatio } });
          observer.complete();
        }
      };

      image.onerror = () => {
        observer.next({ 'imageLoad': true });
        observer.complete();
      };
      
      reader.onload = (e) => {
        image.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    });
  };
}