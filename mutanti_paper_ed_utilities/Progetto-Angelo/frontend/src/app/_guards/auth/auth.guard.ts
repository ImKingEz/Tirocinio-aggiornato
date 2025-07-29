import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const toastr = inject(ToastrService);
  if(authService.isUserAuthenticated()){
    return true;
  } else {
    toastr.warning("Devi essere autenticato per svolgere questa azione", "Non autorizzato!");
    return false; 
  }
};
