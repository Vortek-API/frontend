import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userGroup = sessionStorage.getItem('userGroup');
  if (userGroup) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
