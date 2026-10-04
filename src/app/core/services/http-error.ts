import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error';

export function httpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body: Partial<ApiError> | null = error.error;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (error.status === 0) return 'Le serveur est injoignable. Veuillez réessayer dans quelques instants.';
    if (error.status === 401) return 'Votre connexion a expiré ou vos identifiants sont incorrects.';
    if (error.status === 403) return 'Vous ne disposez pas des autorisations nécessaires.';
    if (error.status === 409) return 'Ces informations sont déjà utilisées.';
  }
  return 'La demande n’a pas pu aboutir. Veuillez réessayer.';
}
