import { Component, input, inject, signal, computed, viewChild, ElementRef, Output, EventEmitter, effect } from '@angular/core';
import { MemeItem } from '../../_services/rest-backend/meme-rest/meme.type';
import { CommonModule } from '@angular/common';
import { MemeRestService } from '../../_services/rest-backend/meme-rest/meme-rest.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../_services/auth/auth.service';
import { CommentComponent } from './comment-item/comment/comment.component';
import { CommentApiResponse } from '../../_services/rest-backend/meme-rest/comment-response.type';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { HttpErrorResponse } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommentComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  memeRestService = inject(MemeRestService);
  toastr = inject(ToastrService);
  authService = inject(AuthService);
  breakpointObserver = inject(BreakpointObserver);

  memeItemInput = input.required<MemeItem>();
  memeState = signal<MemeItem>({} as MemeItem); 
  @Output() memeUpdated = new EventEmitter<MemeItem>();

  formattedTags = computed(() => {
    const item = this.memeState();
    if (item && Array.isArray(item.Tags)) {
      return item.Tags.map(tag => tag.name).join(', ');
    }
    return '';
  });

  commentsCurrentPage: number = 1;

  postContainer = viewChild.required<ElementRef<HTMLDivElement>>('postContainer');
  showComments = signal(false);

  isMobile = signal(false);

  postHeight = computed(() => {
    const postElement = this.postContainer();
    if (!postElement) {
        return null;
    }
    
    const height = postElement.nativeElement.offsetHeight;
    if (this.isMobile()) {
        return height * 0.75;
    } else {
        return height;
    }
  });

  constructor() {
    effect(() => {
      const newMemeFromInput = this.memeItemInput();
      const processedMeme = {
          ...newMemeFromInput,
          createdAt: new Date(newMemeFromInput.createdAt),
          userVoteStatus: (newMemeFromInput.userVoteStatus || 0) as 0 | 1 | -1
      };
      this.memeState.set(processedMeme);
    });

    this.breakpointObserver.observe('(max-width: 767.98px)')
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  toggleUpvote() {
    if (!this.authService.isUserAuthenticated()) {
      this.toastr.warning("Per favore effettua prima l'autenticazione", "Non sei autenticato!");
      return;
    }

    const originalMeme = this.memeState();
    if (originalMeme.userVoteStatus === 1) {
      this.memeState.update(meme => ({ ...meme, upvotes: meme.upvotes - 1, userVoteStatus: 0 }));
    } else {
      this.memeState.update(meme => ({
        ...meme,
        upvotes: meme.upvotes + 1,
        downvotes: meme.userVoteStatus === -1 ? meme.downvotes - 1 : meme.downvotes,
        userVoteStatus: 1
      }));
    }

    this.memeRestService.toggleUpvote(this.memeState()).subscribe({
      next: (updatedMeme: MemeItem) => {
        this.memeState.set(updatedMeme);
        this.memeUpdated.emit(updatedMeme);
      },
      error: (err) => {
        this.memeState.set(originalMeme);
        this.toastr.error("Errore con il voto del meme, riprova", "Oops, c'è stato un errore!");
      }
    });
  }

  toggleDownvote() {
    if (!this.authService.isUserAuthenticated()) {
      this.toastr.warning("Per favore effettua prima l'autenticazione", "Non sei autenticato!");
      return;
    }
    
    const originalMeme = this.memeState();

    if (originalMeme.userVoteStatus === -1) {
      this.memeState.update(meme => ({ ...meme, downvotes: meme.downvotes - 1, userVoteStatus: 0 }));
    } else {
      this.memeState.update(meme => ({
        ...meme,
        downvotes: meme.downvotes + 1,
        upvotes: meme.userVoteStatus === 1 ? meme.upvotes - 1 : meme.upvotes,
        userVoteStatus: -1
      }));
    }

    this.memeRestService.toggleDownvote(this.memeState()).subscribe({
      next: (updatedMeme: MemeItem) => this.memeState.set(updatedMeme),
      error: (err) => {
        this.memeState.set(originalMeme);
        this.toastr.error("Errore con il voto del meme, riprova", "Oops, c'è stato un errore!");
      }
    });
  }

  toggleComments() {
    this.showComments.update(currentValue => !currentValue);
  }

  loadMoreComments() {
    this.memeRestService.fetchMoreComments(this.memeState().id, this.commentsCurrentPage + 1).subscribe({
      next: (data: CommentApiResponse) => {
        const currentMeme = this.memeState();
        const updatedMeme = {
            ...currentMeme,
            Comments: [...currentMeme.Comments, ...data.rows]
        };
        this.memeState.set(updatedMeme);
        this.memeUpdated.emit(updatedMeme);
        this.commentsCurrentPage++;
      }
    });
  }

  commentForm = new FormGroup({
    commentText: new FormControl('', [Validators.required]),
  });

  onCommentSubmit() {
    if (!this.authService.isUserAuthenticated()) {
      this.toastr.warning("Per favore effettua prima l'autenticazione", "Non sei autenticato!");
      return;
    }
    if (this.commentForm.invalid) {
      this.toastr.warning("Il commento non può essere vuoto.", "Errore!");
      return;
    }

    const textValue = this.commentForm.get('commentText')?.value;
    
    if (textValue) {
      this.memeRestService.sendComment(this.memeState().id, textValue).subscribe({
        next: (response: MemeItem) => {
          this.toastr.success("Il commento è stato caricato.", "Completato!");
          this.memeState.set(response);
          this.memeUpdated.emit(response);
          this.commentForm.reset();
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