import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { MemeRestService } from '../../../_services/rest-backend/meme-rest/meme-rest.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../_services/auth/auth.service';
import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'create-post',
  standalone: true,
  imports: [ReactiveFormsModule], 
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss'
})
export class CreatePostComponent {
  authService = inject(AuthService)
  memeRestService = inject(MemeRestService);
  toastr = inject(ToastrService);

  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  memeForm = new FormGroup({
    tags: new FormControl('', [
      Validators.required,
      CustomValidators.tagsPattern() 
    ]),
    memeImage: new FormControl<File | null>(null, [Validators.required])
  });

  onFileChange(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Puoi caricare solo file di tipo immagine.', 'File non valido');
        this.selectedFile = null;
        this.memeForm.patchValue({ memeImage: null });
        (event.target as HTMLInputElement).value = ''; 
        return;
      }

      this.selectedFile = file;
      this.memeForm.patchValue({ memeImage: file });
    }
  }

  onSubmit(): void {
    if (!this.authService.isUserAuthenticated()) {
      this.toastr.warning("Per favore effettua prima l'autenticazione", "Non sei autenticato!");
      return;
    }
    if (this.memeForm.invalid) {
      this.toastr.warning("Inserisci almeno un tag e una foto.", "Errore!")
      return;
    }

    const tagsValue = this.memeForm.get('tags')?.value;
    
    if (tagsValue && this.selectedFile) {
      this.memeRestService.uploadMeme(tagsValue, this.selectedFile).subscribe({
        next: (response) => {
          this.toastr.success("Il post è stato caricato.", "Completato!")
          this.memeForm.reset();
          this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
        },
        error: (err: HttpErrorResponse) => {
          if (err.error && err.error.description) {
            this.toastr.error(err.error.description, "Errore!");
          } else {
            this.toastr.error("Si è verificato un errore sconosciuto.", "Errore!");
          }
        }
      });
    }
  }
}