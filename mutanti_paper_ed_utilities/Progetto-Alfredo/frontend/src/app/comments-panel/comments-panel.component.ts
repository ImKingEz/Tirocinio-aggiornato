import { Component, EventEmitter, Input, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentData } from '../_services/rest-backend/comment-item.type';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { AuthService } from '../_services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PanelStateService } from '../_services/panel-state.service';
import { noWhitespaceValidator } from '../_validators/no-whitespace.validator';
import { MemeItem } from '../_services/rest-backend/meme-item.type';

@Component({
  selector: 'app-comments-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommentItemComponent],
  templateUrl: './comments-panel.component.html',
  styleUrl: './comments-panel.component.scss'
})
export class CommentsPanelComponent {
  @Input() memeId: number | null = null;
  @Input() isOpen = false;

  @Output() memeStateUpdated = new EventEmitter<MemeItem>();

  private restService = inject(RestBackendService);
  authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private panelStateService = inject(PanelStateService);

  comments: CommentData[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = true;
  error: string | null = null;

  newCommentControl = new FormControl('', [Validators.required, noWhitespaceValidator()]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.memeId) {
      this.fetchComments(1);
    }
  }

  fetchComments(page: number): void {
    if (!this.memeId) return;

    this.isLoading = true;
    this.error = null;
    this.currentPage = page;

    this.restService.getComments(this.memeId, this.currentPage).subscribe({
      next: (response) => {
        this.comments = response.comments;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Errore nel caricare i commenti:", err);
        this.error = "Impossibile caricare i commenti.";
        this.isLoading = false;
      }
    });
  }

  submitComment(): void {
    if (!this.authService.isAuthenticated()) {
      this.toastr.error("Devi effettuare il login per poter commentare.", "Attenzione!");
      return;
    }
    if (this.newCommentControl.invalid || !this.memeId) {
      return;
    }

    const text = this.newCommentControl.value!;

    this.restService.postComment(this.memeId, text).subscribe({
      next: (updatedMemeFromServer) => {
        this.newCommentControl.reset();
        
        this.memeStateUpdated.emit(updatedMemeFromServer);
        
        this.fetchComments(1);
      },
      error: (err) => {
        console.error("Errore nell'invio del commento:", err);
        this.toastr.error("Impossibile inviare il commento.", "Attenzione!");
      }
    });
  }
  
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.fetchComments(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.fetchComments(this.currentPage + 1);
    }
  }

  requestClose(): void {
    this.panelStateService.close();
  }
}