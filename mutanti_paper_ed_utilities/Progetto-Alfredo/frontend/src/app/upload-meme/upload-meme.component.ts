import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { noWhitespaceValidator } from '../_validators/no-whitespace.validator';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { maxTagsValidator } from '../_validators/max-tags.validator';
import { alphanumericTagsValidator } from '../_validators/alphanumeric-tags.validator';
import { imageRatioValidator } from '../_validators/image-ratio.validator';

@Component({
  selector: 'app-upload-meme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-meme.component.html',
  styleUrl: './upload-meme.component.scss',
  host: {
    class: 'block flex-grow flex flex-col relative'
  }
})
export class UploadMemeComponent {
   private router = inject(Router);
  private toastr = inject(ToastrService);
  private restService = inject(RestBackendService);

  uploadForm: FormGroup;
  isUploading = false;

  constructor() {
    this.uploadForm = new FormGroup({
      memeImage: new FormControl<File | null>(null, [Validators.required],
        [imageRatioValidator([1, 4/5], 0.02)]),
      tags: new FormControl('', [Validators.required, noWhitespaceValidator(), maxTagsValidator(3),
        alphanumericTagsValidator()])
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.uploadForm.patchValue({
        memeImage: file
      });
      this.uploadForm.get('memeImage')?.updateValueAndValidity();
    }
  }
  
  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.toastr.error('Devi caricare un\'immagine e inserire almeno un tag.', 'Attenzione!');
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    
    formData.append('memeImage', this.uploadForm.get('memeImage')?.value);
    
    formData.append('tags', this.uploadForm.get('tags')?.value);
    
    this.restService.uploadMeme(formData).subscribe({
      next: (createdMeme) => {
        this.toastr.success('Meme caricato con successo!', 'Grande!');
        this.isUploading = false;
        this.router.navigate(['/']); 
      },
      error: (err) => {
        const errorMessage = err.error?.description || 'Errore durante il caricamento del meme. Riprova.';
        this.toastr.error(errorMessage, 'Attenzione!');
        console.error(err);
        this.isUploading = false;
      }
    });
  }
  
  navigateToHome() {
    this.router.navigate(['/']);
  }
}