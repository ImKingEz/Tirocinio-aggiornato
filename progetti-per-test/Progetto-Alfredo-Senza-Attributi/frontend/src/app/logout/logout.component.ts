import { Component, inject } from '@angular/core';
import { AuthService } from '../_services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  template: '',
  styles: ''
})
export class LogoutComponent {

  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);

  ngOnInit() {
    if(! this.authService.isAuthenticated()){
      this.toastr.warning("Non sei ancora loggato", "Attenzione!");
      this.router.navigateByUrl("/");
    } else {
      this.toastr.warning(`Ci vediamo presto, ${this.authService.user()}!`, "Hai appena effettuato il logout");
      this.authService.logout();
      this.router.navigateByUrl("/");
    }
  }

}
