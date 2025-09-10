import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../_services/auth/auth.service';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { noWhitespaceValidator } from '../_validators/no-whitespace.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  host: {
    class: 'flex flex-col flex-grow w-full'
  }
})
export class LoginComponent {

  router = inject(Router);
  toastr = inject(ToastrService);
  restService = inject(RestBackendService);
  authService = inject(AuthService);
  submitted = false;

  private initialCredentials?: { user: string, pass: string };

  loginForm = new FormGroup({
    user: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    pass: new FormControl('', [Validators.required, noWhitespaceValidator()]) 
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { credentials: { user: string, pass: string } };

    if (state?.credentials) {
      this.initialCredentials = state.credentials;
    }
  }

  ngOnInit(): void {
    if (this.initialCredentials) {
      this.loginForm.patchValue({
        user: this.initialCredentials.user,
        pass: this.initialCredentials.pass
      });
    }
  }
  
  handleLogin() {
    this.submitted = true;
    if(this.loginForm.invalid){
      this.toastr.error("I dati forniti non sono validi", "Attenzione!");
    } else {
      this.restService.login({
        usr: this.loginForm.value.user as string,
        pwd: this.loginForm.value.pass as string,
      }).subscribe({
        next: (token) => {
          this.authService.updateToken(token).then(() => {
            this.toastr.success(`Ora puoi finalmente intergaire con i meme`,`Benvenuto ${this.loginForm.value.user}!`);
            setTimeout(() => {this.router.navigateByUrl("")}, 10);
          });
        },
        error: (err) => {
          const errorMessage = err.error?.description || 'Errore durante il login. Riprova.';
          this.toastr.error(errorMessage, 'Attenzione!');
        },
        complete: () => {}
      })
    }
  }
  
  navigateToHome() {
    this.router.navigate(['/']);
  }
}
