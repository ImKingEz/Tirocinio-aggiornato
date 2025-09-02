import { Component, inject, effect, signal } from '@angular/core';
import { PostComponent } from '../post-item/post.component';
import { MemeRestService } from '../../_services/rest-backend/meme-rest/meme-rest.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../_services/auth/auth.service';
import { MemeItem } from '../../_services/rest-backend/meme-rest/meme.type';

@Component({
  selector: 'app-dailypage',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './dailypage.component.html',
  styleUrl: './dailypage.component.scss'
})
export class DailypageComponent {
  memeRestService = inject(MemeRestService);
  toastr = inject(ToastrService);
  authService = inject(AuthService);

  dailyMeme = signal<MemeItem | undefined>(undefined);
  dailyType = signal<string>('');

  constructor() {
    effect(() => {
      this.authService.isAuthenticated();
      this.fetchDailyMeme();
      window.scrollTo(0, 0);
    });
  }

  fetchDailyMeme() {
    this.memeRestService.getDailyMeme().subscribe({
      next: (data: { meme: MemeItem, bucketType: string }) => {
        this.dailyMeme.set(data.meme);
        switch (data.bucketType) {
          case "NEW_ARRIVAL": this.dailyType.set("tra i più recenti ⏱️"); break;
          case "TOP_VOTED": this.dailyType.set("tra i più divertenti ✅"); break;
          case "LEAST_VOTED": this.dailyType.set("tra i più noiosi ❌"); break;
          case "RANDOM_FALLBACK": this.dailyType.set("casuale"); break;
        }
      },
      error: (err) => {
        this.toastr.error(err.message, err.statusText)
        this.dailyMeme.set(undefined);
      },
      complete: () => {

      }
    });
  }

  onDailyMemeUpdated(updatedMeme: MemeItem) {
    this.dailyMeme.set(updatedMeme);
  }
}
