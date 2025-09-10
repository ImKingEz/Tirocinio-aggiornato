import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MemeItemComponent } from '../meme-item/meme-item.component';
import { MemeItem } from '../_services/rest-backend/meme-item.type';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MemeItemComponent, CommonModule], 
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  host: {
    class: 'flex flex-col flex-grow w-full'
  }
})
export class HomePageComponent {
  
  // Proprietà impostate con valori di default per la visualizzazione
  isLoading = false;
  error: string | null = null;
  
  memes: MemeItem[] = []; // Array vuoto per mostrare il messaggio "Nessun meme trovato"

  currentPage = 1;
  totalPages = 1;
  totalMemes = 0;

  // L'intera logica del form, inclusi il costruttore, ngOnInit
  // e i metodi come fetchMemes, onSearchSubmit, ecc. sono stati rimossi.
}