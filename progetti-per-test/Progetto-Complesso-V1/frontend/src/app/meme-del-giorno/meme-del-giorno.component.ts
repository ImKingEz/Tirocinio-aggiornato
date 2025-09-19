import { Component, effect, inject } from '@angular/core';
import { MemeItemComponent } from '../meme-item/meme-item.component';
import { MemeItem } from '../_services/rest-backend/meme-item.type';
import { Router } from '@angular/router';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../_services/auth/auth.service';

@Component({
  selector: 'app-meme-del-giorno',
  standalone: true,
  imports: [CommonModule, MemeItemComponent],
  templateUrl: './meme-del-giorno.component.html',
  styleUrl: './meme-del-giorno.component.scss',
  host: {
    class: 'block flex-grow flex flex-col relative'
  }
})
export class MemeDelGiornoComponent {

  private router = inject(Router);
  private restBackendService = inject(RestBackendService);
  private authService = inject(AuthService);

  meme: MemeItem | undefined;
  isLoading: boolean = true;
  error: string | null = null;
  
  private initialLoadDone = false;

  constructor() {
    effect(() => {
      this.authService.isAuthenticated();
      if (this.initialLoadDone) {
        this.fetchMemeOfTheDay();
      }
    });
  }

  ngOnInit(): void {
    this.fetchMemeOfTheDay();
  }

  fetchMemeOfTheDay(): void {
    this.isLoading = true;
    this.error = null;
    this.restBackendService.getMemeOfTheDay().subscribe({
      next: (data) => {
        this.meme = data;
        this.isLoading = false;
        this.initialLoadDone = true;
      },
      error: (err) => {
        console.error('Errore nel caricare il meme del giorno:', err);
        this.error = "Impossibile caricare il meme del giorno.";
        this.isLoading = false;
        this.initialLoadDone = true;
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}