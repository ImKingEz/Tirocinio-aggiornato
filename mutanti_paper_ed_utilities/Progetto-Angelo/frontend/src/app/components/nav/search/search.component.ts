import { Component, ElementRef, HostListener, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService, SearchParams } from '../../../_services/search/search.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  searchService = inject(SearchService);
  elementRef = inject(ElementRef);

  isSearchPanelOpen = signal(false);
  isFilterPanelOpen = signal(false);
  isFilterDropdownOpen = signal(false);
  
  isAnyPanelOpen = computed(() => this.isSearchPanelOpen() || this.isFilterPanelOpen());

  selectedFilterOption = signal("Più recenti");
  selectedFilterType = signal<"createdAt" | "upvotes" | "downvotes">('createdAt');
  selectedFilterDirection = signal<"ASC" | "DESC">("DESC");

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dateInputRef') dateInputRef!: ElementRef<HTMLInputElement>;

  searchForm = new FormGroup({
    tags: new FormControl('', { nonNullable: true }),
    selectedDate: new FormControl('', { nonNullable: true })
  });

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isAnyPanelOpen()) {
      this.closeAllPanels();
    }
  }

  closeAllPanels() {
    this.isSearchPanelOpen.set(false);
    this.isFilterPanelOpen.set(false);
    this.isFilterDropdownOpen.set(false);
  }

  closeAllPanelsOrOpenSearch() {
    if (this.isAnyPanelOpen()) {
      this.closeAllPanels();
    } else {
      this.openSearchPanel();
    }
  }

  openSearchPanel() {
    this.isSearchPanelOpen.set(true);
    this.isFilterPanelOpen.set(false);
    setTimeout(() => this.searchInputRef.nativeElement.focus(), 0);
  }

  openFilterPanel() {
    this.isFilterPanelOpen.set(true);
    this.isSearchPanelOpen.set(false);
  }

  ngOnInit() {
    const currentParams = this.searchService.searchParams();

    this.searchForm.setValue({
      tags: currentParams.tags || '',
      selectedDate: currentParams.selectedDate || ''
    });
    this.selectedFilterType.set(currentParams.sortType);
    this.selectedFilterDirection.set(currentParams.sortDirection);
    this.updateFilterOptionText(currentParams.sortType, currentParams.sortDirection);
  }
  
  private updateFilterOptionText(type: string, direction: string) {
    if (type === 'createdAt' && direction === 'DESC') this.selectedFilterOption.set('Più recenti');
    else if (type === 'createdAt' && direction === 'ASC') this.selectedFilterOption.set('Meno recenti');
    else if (type === 'upvotes' && direction === 'DESC') this.selectedFilterOption.set('Più piaciuti');
    else if (type === 'downvotes' && direction === 'DESC') this.selectedFilterOption.set('Meno piaciuti');
    else this.selectedFilterOption.set('Più recenti');
  }

  performSearch() {
    const formValues = this.searchForm.value;
    const searchParams: Partial<SearchParams> = {
      tags: formValues.tags,
      selectedDate: formValues.selectedDate,
      sortType: this.selectedFilterType(),
      sortDirection: this.selectedFilterDirection(),
      page: 1,
    };
    this.searchService.updateSearchParams(searchParams);

    this.closeAllPanels();
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.blur();
    }
  }

  clearSearch() {
    this.searchService.resetSearchParams();

    this.searchForm.setValue({
      tags: '',
      selectedDate: ''
    });
    this.selectedFilterType.set('createdAt');
    this.selectedFilterDirection.set('DESC');
    this.updateFilterOptionText('createdAt', 'DESC');
    
    this.performSearch();
  }

  isAnyFilterApplied(): boolean {
    const currentParams = this.searchService.searchParams();
    return (
      currentParams.tags !== '' ||
      currentParams.selectedDate !== '' ||
      currentParams.sortType !== 'createdAt' ||
      currentParams.sortDirection !== 'DESC'
    );
  }

  toggleFilterDropdown() {
    this.isFilterDropdownOpen.update(value => !value);
  }

  selectFilterOption(option: 'recente' | 'meno_recente' | 'piu_piaciuti' | 'meno_piaciuti') {
    switch (option) {
      case 'recente':
        this.selectedFilterOption.set('Più recenti');
        this.selectedFilterType.set("createdAt");
        this.selectedFilterDirection.set("DESC");
        break;
      case 'meno_recente':
        this.selectedFilterOption.set('Meno recenti');
        this.selectedFilterType.set("createdAt");
        this.selectedFilterDirection.set("ASC");
        break;
      case 'piu_piaciuti':
        this.selectedFilterOption.set('Più piaciuti');
        this.selectedFilterType.set("upvotes");
        this.selectedFilterDirection.set("DESC");
        break;
      case 'meno_piaciuti':
        this.selectedFilterOption.set('Meno piaciuti');
        this.selectedFilterType.set("downvotes");
        this.selectedFilterDirection.set("DESC");
        break;
    }
    this.isFilterDropdownOpen.set(false);
  }

  openDatePicker() {
    if (this.dateInputRef && this.dateInputRef.nativeElement) {
      if (typeof this.dateInputRef.nativeElement.showPicker === 'function') {
        this.dateInputRef.nativeElement.showPicker();
      } else {
        this.dateInputRef.nativeElement.click();
      }
    }
  }
}