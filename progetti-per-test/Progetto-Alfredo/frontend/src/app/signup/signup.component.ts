import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { noWhitespaceValidator } from '../_validators/no-whitespace.validator';
import { containsNumberValidator } from '../_validators/contains-number.validator';
import { containsUppercaseValidator } from '../_validators/contains-uppercase.validator';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  host: {
    class: 'flex flex-col flex-grow w-full'
  }
})
export class SignupComponent {

  router = inject(Router);
  toastr = inject(ToastrService);
  restService = inject(RestBackendService);
  
  signupForm = new FormGroup({
    user: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10),
      noWhitespaceValidator()]),
    pass: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      containsNumberValidator(),
      containsUppercaseValidator(),
      noWhitespaceValidator()])
  })
  
  handleSignup() {
    console.log("Signup");
    if(this.signupForm.invalid){
      this.toastr.error("I dati forniti non sono validi", "Attenzione!");
    } else {
      const userData = {
        usr: this.signupForm.value.user as string,
        pwd: this.signupForm.value.pass as string,
      };
      this.restService.signup(userData).subscribe({
        error: (err) => {
          const errorMessage = err.error?.description || 'Errore durante la registrazione. Riprova.';
          this.toastr.error(errorMessage, 'Attenzione!');
        },
        complete: () => {
          this.toastr.success(`Effettua subito l'accesso al tuo account`,`Congratulazioni ${this.signupForm.value.user}!`);
          this.router.navigate(['/login'], {
            state: {
              credentials: {
                user: userData.usr,
                pass: userData.pwd
              }
            }
          });
        }
      })
    }
  }
  
  navigateToHome() {
    this.router.navigate(['/']);
  }
}
