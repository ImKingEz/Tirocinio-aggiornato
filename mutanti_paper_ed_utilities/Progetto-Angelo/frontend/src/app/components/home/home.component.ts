import { Component, inject, effect, signal, computed } from '@angular/core';
import { CreatePostComponent } from './create-post/create-post.component';
import { PostComponent } from "../post-item/post.component";
import { MemeItem } from '../../_services/rest-backend/meme-rest/meme.type';
import { ToastrService } from 'ngx-toastr';
import { MemeRestService } from '../../_services/rest-backend/meme-rest/meme-rest.service';
import { MemeApiResponse } from '../../_services/rest-backend/meme-rest/meme-response.type';
import { AuthService } from '../../_services/auth/auth.service';
import { SearchService } from '../../_services/search/search.service';

@Component({
  selector: 'app-home',
  imports: [CreatePostComponent, PostComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  memeRestService = inject(MemeRestService);
  toastr = inject(ToastrService);
  authService = inject(AuthService);
  searchService = inject(SearchService);

  memes = signal<MemeItem[]>([]); 
  memesData = signal<MemeApiResponse>({ rows: [], count: 0, totalPages: 0 });

  currentPage = computed(() => this.searchService.searchParams().page || 1);
  currentSize = computed(() => this.searchService.searchParams().size || 10);

  isLoading = signal<boolean>(true);

  constructor() {
    effect(() => {
      this.memeRestService.postCreated$();
      this.authService.isAuthenticated();
      
      this.fetchMemes();
      window.scrollTo(0, 0);
    });
  }

  fetchMemes() {
    this.isLoading.set(true);
    this.memeRestService.getMemes(this.searchService.searchParams()).subscribe({
      next: (data: MemeApiResponse) => {
        this.memes.set(data.rows);
        this.memesData.set(data);
      },
      error: (err) => {
        this.toastr.error(err.message, err.statusText)
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onMemeUpdated(updatedMeme: MemeItem) {
    this.memes.update(currentMemes => {
      const index = currentMemes.findIndex(meme => meme.id === updatedMeme.id);
      if (index !== -1) {
        const newMemes = [...currentMemes];
        newMemes[index] = updatedMeme;
        return newMemes;
      }
      return currentMemes;
    });
  }

  nextPage() {
    if (this.memesData().totalPages > this.currentPage()) {
      this.searchService.updateSearchParams({ page: this.currentPage() + 1 });
    } else {
      this.toastr.info("Sei già all'ultima pagina!", "Fine paginazione");
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.searchService.updateSearchParams({ page: this.currentPage() - 1 });
    } else {
      this.toastr.info("Sei già alla prima pagina!", "Inizio paginazione");
    }
  }
}
