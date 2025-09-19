import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MemeItemComponent } from '../meme-item/meme-item.component';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { MemeItem } from '../_services/rest-backend/meme-item.type';
import { AuthService } from '../_services/auth/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MemeItemComponent, CommonModule, ReactiveFormsModule, DatePipe], 
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  host: {
    class: 'flex flex-col flex-grow w-full'
  }
})
export class HomePageComponent {

  private restBackendService = inject(RestBackendService);
  private authService = inject(AuthService);

  private initialLoadDone = false; 
  
  isLoading = true;
  error: string | null = null;
  
  memes: MemeItem[] = [];

  @ViewChild('dateInput') dateInput: ElementRef<HTMLInputElement>;
  
  currentPage = 1;
  totalPages = 1;
  totalMemes = 0;

  searchForm: FormGroup;

  constructor() {
    this.searchForm = new FormGroup({
      uploaddate: new FormControl(''),
      tagsQuery: new FormControl(''),
      sortby: new FormControl(''),
      sortorder: new FormControl(''),
      limit: new FormControl(''),
    });

    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated(); 

      if (this.initialLoadDone) {
        console.log('Stato di autenticazione cambiato, ricarico i meme...');
        this.currentPage = 1;
        this.fetchMemes();
      }
    });
  }

  ngOnInit(): void {
    this.fetchMemes();
  }

  fetchMemes(): void {
    this.isLoading = true;
    this.error = null;

    const formValues = this.searchForm.value;

    const filters = {
      ...this.searchForm.value,
      page: this.currentPage
    };

    this.restBackendService.searchMemes(filters).subscribe({
      next: (response) => {
        this.memes = response.memes;
        
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalMemes = response.totalMemes;
        
        this.isLoading = false;
        this.initialLoadDone = true; 
      },
      error: (err) => {
        console.error("Errore durante la ricerca dei meme:", err);
        this.error = "Impossibile caricare i meme. Riprova più tardi.";
        this.isLoading = false;
        this.initialLoadDone = true;
      }
    });
  }
  
  onSearchSubmit(): void {
    this.currentPage = 1;
    this.fetchMemes();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMemes();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchMemes();
    }
  }

  resetVisualizzazioneFilters() {
    this.searchForm.patchValue({
      sortby: '',
      sortorder: '',
      limit: ''
    });
    this.onSearchSubmit();
  }

  openDatePicker(): void {
    this.dateInput.nativeElement.showPicker();
  }
}