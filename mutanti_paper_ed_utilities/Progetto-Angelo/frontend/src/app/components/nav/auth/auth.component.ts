import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../_services/auth/auth.service';
import { AuthRestService } from '../../../_services/rest-backend/auth-rest/auth-rest.service';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  authService = inject(AuthService);
  authRestService = inject(AuthRestService);
  router = inject(Router);
  toastr = inject(ToastrService);

  showPassword = false;
  @Output() close = new EventEmitter<void>();

  submitted = false;
  isInitialized = false;

  authForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      CustomValidators.usernamePattern()
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      CustomValidators.passwordStrength()
    ])
  });

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.isInitialized = true;
    }, 0);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  processAuth(type: 'register' | 'login') {
    this.submitted = true;

    this.authForm.markAllAsTouched();
    const customToastConfig = {
      positionClass: 'toast-top-center',
      timeOut: 3000,
    };

    if (this.authForm.invalid) {
      this.toastr.warning("Per favore, compila tutti i campi richiesti e correggi gli errori.", "Oops! Dati non validi!", customToastConfig);
      return;
    }

    const { username, password } = this.authForm.value;

    if (type === 'register') {
      this.authRestService.signup({usr: username as string, pwd: password as string}).subscribe({
        next: () => {
          this.toastr.success(`Ora puoi effettuare il login`,`Registrazione completata!`, customToastConfig);
          this.close.emit();
          this.submitted = false;
        },
        error: (err) => {
          this.toastr.warning("L'username è già in uso, scegline un altro", "Oops! Username duplicato", customToastConfig);
          this.submitted = false;
        }
      })
    } else {
      this.authRestService.login({usr: username as string, pwd: password as string}).subscribe({
        next: (token) => {
          this.authService.updateToken(token).then(() => {
            this.toastr.success(`Login effettuato con successo`,`Benvenuto ${username}!`);
            this.close.emit();
            this.authForm.reset();
            this.submitted = false;
          });
        },
        error: (err) => {
          this.toastr.error("Per favore, fornisci delle credenziali valide", "Oops! Credenziali errate", customToastConfig);
          this.submitted = false;
        }
      })
    }
  }

  onRegister() {
    this.processAuth('register');
  }

  onLogin() {
    this.processAuth('login');
  }
}