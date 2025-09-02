import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PanelStateService {

  private activePanelId = signal<number | null>(null);

  public readonly activeId = this.activePanelId.asReadonly();

  open(memeId: number): void {
    this.activePanelId.set(memeId);
  }

  close(): void {
    this.activePanelId.set(null);
  }

  toggle(memeId: number): void {
    this.activePanelId.update(currentId => 
      currentId === memeId ? null : memeId
    );
  }
}