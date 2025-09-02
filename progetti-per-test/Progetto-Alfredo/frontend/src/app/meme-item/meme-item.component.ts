import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { ToastrService } from 'ngx-toastr';
import { MemeItem } from '../_services/rest-backend/meme-item.type';
import { AuthService } from '../_services/auth/auth.service';
import { CommentsPanelComponent } from '../comments-panel/comments-panel.component';
import { PanelStateService } from '../_services/panel-state.service';

@Component({
  selector: 'app-meme-item',
  standalone: true,
  imports: [CommonModule, DatePipe, CommentsPanelComponent],
  templateUrl: './meme-item.component.html',
  styleUrl: './meme-item.component.scss'
})
export class MemeItemComponent {
  @Input({ required: true }) meme: MemeItem;

  readonly apiUrl = 'http://localhost:3000';

  private restBackend = inject(RestBackendService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private panelStateService = inject(PanelStateService);

  get isCommentsPanelOpen(): boolean {
    return this.panelStateService.activeId() === this.meme.id;
  }

  toggleCommentsPanel(event: Event): void {
    event.stopPropagation();
    this.panelStateService.toggle(this.meme.id);
  }

  onUpvote(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      this.toastr.error("Effettua il login per poter interagire con i meme", "Attenzione!");
      return;
    }

    const previousMemeState = { ...this.meme };
    const updatedMeme = { ...this.meme };
    
    if (updatedMeme.userVote == 1) {
      updatedMeme.userVote = null;
      updatedMeme.upvotes--;
    } else {
      if (updatedMeme.userVote == -1) updatedMeme.downvotes--;
      updatedMeme.userVote = 1;
      updatedMeme.upvotes++;
    }
    
    this.meme = updatedMeme;

    this.restBackend.upvoteMeme(this.meme.id).subscribe({
      next: (updatedMemeFromServer) => {
        this.meme = { ...this.meme, ...updatedMemeFromServer };
      },
      error: () => {
        this.meme = previousMemeState;
        this.toastr.error("Impossibile registrare il voto.", "Attenzione!");
      }
    });
  }

  onDownvote(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      this.toastr.error("Effettua il login per poter interagire con i meme", "Attenzione!");
      return;
    }
    
    const previousMemeState = { ...this.meme };
    const updatedMeme = { ...this.meme };

    if (updatedMeme.userVote == -1) {
      updatedMeme.userVote = null;
      updatedMeme.downvotes--;
    } else {
      if (updatedMeme.userVote == 1) updatedMeme.upvotes--;
      updatedMeme.userVote = -1;
      updatedMeme.downvotes++;
    }
    this.meme = updatedMeme;

    this.restBackend.downvoteMeme(this.meme.id).subscribe({
      next: (updatedMemeFromServer) => {
        this.meme = { ...this.meme, ...updatedMemeFromServer };
      },
      error: () => {
        this.meme = previousMemeState;
        this.toastr.error("Impossibile registrare il voto.", "Errore");
      }
    });
  }

  handleMemeStateUpdate(updatedMeme: MemeItem): void {
    this.meme = {
      ...this.meme,
      commentCount: updatedMeme.commentCount,
      upvotes: updatedMeme.upvotes,
      downvotes: updatedMeme.downvotes,
    };
  }
}