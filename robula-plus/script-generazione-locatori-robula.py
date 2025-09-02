from Robula.robula_plus import RobulaPlus

html_document_string = """
<section class="py-6 bg-[#eef1f5]">
  <form [formGroup]="searchForm" (ngSubmit)="onSearchSubmit()">
    <div class="container max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 justify-center">
        <div
          class="search-sub-block border border-[#d1d9e0] p-5 rounded-lg bg-[#f8f9fa] w-full md:flex-1 md:min-w-[320px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <h3 class="text-[1.1rem] font-semibold text-gray-800 mb-5 text-center md:text-left">Filtra meme per :</h3>
          <div class="controls-row flex flex-wrap gap-3 items-end">
            <div class="form-group flex flex-col items-center">
              <label for="uploadDate" id="date-label" class="block text-sm font-medium text-gray-700 mb-2 text-center">Data di upload</label>
              <button type="button" (click)="openDatePicker()" aria-labelledby="date-label"
                class="custom-date-input-pill relative inline-flex items-center bg-[#D97706] text-white rounded-full text-[0.9rem] font-medium cursor-pointer min-w-[140px] text-left focus:outline-none py-[0.55rem] pl-[0.9rem] pr-[2.4rem]">
              
                <span class="pill-text flex-grow leading-normal">
                  {{ searchForm.get('uploaddate')?.value ? (searchForm.get('uploaddate')?.value | date:'dd/MM/yyyy') : 'Scegli...' }}
                </span>
              
                <span class="absolute right-[0.7rem] top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                    <path
                      d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" />
                  </svg>
                </span>
              </button>
              <input #dateInput id="uploadDate" name="uploadDate" type="date" formControlName="uploaddate" class="sr-only" />
            </div>
            <div class="form-group flex-1 relative">
              <div
                class="custom-text-input-grey flex items-center bg-gray-300 py-[0.55rem] px-[0.8rem] rounded-md text-[0.9rem] font-medium focus-within:border focus-within:border-amber-400 focus-within:shadow-[0_0_0_2px_rgba(217,119,6,0.25)] w-full">
                <label for="tagsQuery" class="mr-[0.5em] text-gray-800 whitespace-nowrap">tag:</label>
                <input type="text" id="tagsQuery" formControlName="tagsQuery" placeholder="es. calcio, divertimento"
                  class="flex-grow border-none bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none p-0" />
              </div>
              <p class="absolute top-full mt-1 text-xs text-gray-500 pl-1 hidden sm:block">
                💡Inserendo solo spazi vuoti non ci sarà nessun'influenza sulla ricerca.
              </p>
            </div>

          </div>
        </div>

        <!-- BLOCCO GESTISCI VISUALIZZAZIONE -->
        <div
          class="search-sub-block border border-[#d1d9e0] p-5 rounded-lg bg-[#f8f9fa] w-full md:flex-1 md:min-w-[250px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <h3 class="search-block-title text-[1.1rem] font-semibold text-gray-800 mb-5 text-center md:text-left">
            Gestisci
            la
            visualizzazione</h3>
          <div class="controls-row flex flex-wrap justify-center md:justify-start gap-3 items-end mb-4">

            <!-- Ordina per -->
            <div class="form-group flex flex-col items-center">
              <label for="sortby" class="block text-sm font-medium text-gray-700 mb-2 text-center">Ordina per</label>
              <div class="relative w-full">
                <select data-testid="filter-sort-by" id="sortby" formControlName="sortby"
                  class="pill-select appearance-none bg-[#D97706] text-white py-[0.55rem] pl-[0.9rem] pr-[2.4rem] rounded-full border-0 text-[0.9rem] font-medium cursor-pointer min-w-[140px] text-left focus:outline-none focus:shadow-[0_0_0_2px_#B45309,0_0_0_4px_rgba(255,255,255,0.7)] w-full">
                  <option value="" disabled class="bg-white text-black">Scegli...</option>
                  <option value="date" class="bg-white text-black">data di upload</option>
                  <option value="upvotes" class="bg-white text-black">upvotes</option>
                  <option value="downvotes" class="bg-white text-black">downvotes</option>
                </select>
                <div
                  class="absolute right-[0.9rem] top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                    class="fill-white w-[0.9em] h-[0.9em]">
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Ordina in modo -->
            <div class="form-group flex flex-col items-center">
              <label for="sortorder" class="block text-sm font-medium text-gray-700 mb-2 text-center">Ordina in modo</label>
              <div class="relative w-full">
                <select data-testid="filter-sort-order" id="sortorder" formControlName="sortorder"
                  class="pill-select appearance-none bg-[#D97706] text-white py-[0.55rem] pl-[0.9rem] pr-[2.4rem] rounded-full border-0 text-[0.9rem] font-medium cursor-pointer min-w-[140px] text-left focus:outline-none focus:shadow-[0_0_0_2px_#B45309,0_0_0_4px_rgba(255,255,255,0.7)] w-full">
                  <option value="" disabled selected class="bg-white text-black">Scegli...</option>
                  <option value="asc" class="bg-white text-black">crescente</option>
                  <option value="desc" class="bg-white text-black">decrescente</option>
                </select>
                <div
                  class="absolute right-[0.9rem] top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                    class="fill-white w-[0.9em] h-[0.9em]">
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Meme per pagina -->
            <div class="form-group flex flex-col items-center">
              <label for="limit" class="block text-sm font-medium text-gray-700 mb-2 text-center">Meme per pagina</label>
              <div class="relative w-full">
                <select data-testid="filter-limit" id="limit" formControlName="limit"
                  class="pill-select appearance-none bg-[#D97706] text-white py-[0.55rem] pl-[0.9rem] pr-[2.4rem] rounded-full border-0 text-[0.9rem] font-medium cursor-pointer min-w-[140px] text-left focus:outline-none focus:shadow-[0_0_0_2px_#B45309,0_0_0_4px_rgba(255,255,255,0.7)] w-full">
                  <option value="" disabled selected class="bg-white text-black">Scegli...</option>
                  @for (num of [1, 2, 3, 4, 5, 6]; track num) {
                    <option [value]="num" class="bg-white text-black">{{ num }}</option>
                  }
                </select>
                <div
                  class="absolute right-[0.9rem] top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                    class="fill-white w-[0.9em] h-[0.9em]">
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div> 

          <div class="flex justify-center mt-6">
            <button data-testid="filters-reset-button" id="reset-filters-button" type="button" (click)="resetVisualizzazioneFilters()"
              class="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm py-1.5 px-6 rounded-lg shadow-md focus:outline-none transition duration-150 ease-in-out">
              Resetta Filtri
            </button>
          </div>

        </div>
      </div>
    </div>

    <div class="py-2 bg-[#eef1f5] mt-4">
      <div class="container max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <button type="submit" [disabled]="isLoading"
          class="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold py-2 px-8 rounded-lg shadow-md focus:outline-none transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait">
          Cerca
        </button>
      </div>
    </div>
  </form>
</section>

<!-- MAIN CONTENT -->
<div class="home-content grow py-8">
  <div
    class="meme-grid grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-9 justify-items-center px-4 max-w-[1200px] mx-auto">

    @if(isLoading) {
      <p class="col-span-full text-center p-8 text-gray-600 font-semibold">Caricamento dei meme...</p>
    }
    @else if(error) {
      <p class="col-span-full text-center p-8 text-red-600 bg-red-100 rounded-md">{{ error }}</p>
    }
    @else {
      @for (meme of memes; track meme.id) {
        <app-meme-item [meme]="meme"></app-meme-item>
      } @empty {
        <p class="empty-message col-span-full text-center p-8 italic text-gray-500">Nessun meme trovato.</p>
      }
    }
  </div>
</div>

<!-- SEZIONE PAGINAZIONE -->
<div class="py-4 bg-[#eef1f5]">
  <div class="container max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center gap-1">
      <span class="text-base text-gray-600 font-medium">pagina</span>
      <div class="flex items-center gap-4">
        <button type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 1 || isLoading"
          class="p-1 rounded-md hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
          aria-label="Pagina precedente">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="w-5 h-5 fill-gray-700">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
          </svg>
        </button>

        <span class="text-2xl font-bold text-gray-800">{{ currentPage }}</span>

        <button type="button" (click)="goToNextPage()" [disabled]="currentPage === totalPages || isLoading"
          class="p-1 rounded-md hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
          aria-label="Pagina successiva">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="w-5 h-5 fill-gray-700">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
"""

robula = RobulaPlus()

document = robula.makeDocument(html_document_string)

target_element = document.xpath("//input[@id='tagsQuery']")[0]
robust_xpath = robula.getRobustXPath(element=target_element, document=document)
print(f"XPath Robusto generato da Robula+: {robust_xpath}")

target_element = document.xpath("//select[@id='sortorder']")[0]
robust_xpath = robula.getRobustXPath(element=target_element, document=document)
print(f"XPath Robusto generato da Robula+: {robust_xpath}")

target_element = document.xpath("//button[@id='reset-filters-button']")[0]
robust_xpath = robula.getRobustXPath(element=target_element, document=document)
print(f"XPath Robusto generato da Robula+: {robust_xpath}")