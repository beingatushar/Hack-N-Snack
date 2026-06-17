import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

// Module-level lock shared across all requests so concurrent 401s trigger only
// a single refresh. `null` = no refresh in flight; otherwise it emits the new
// access token once the in-flight refresh completes.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/** Endpoints that must never trigger a refresh-and-retry (would infinite-loop). */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/refresh') || url.includes('/auth/login');
}

/** Re-attach the current access token to a request before retrying it. */
function withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only intercept auth failures; let everything else propagate untouched.
      if (err.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      // No refresh token to fall back on — log out immediately.
      if (!auth.getRefreshToken()) {
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }

      return handle401(req, next, auth, router, err);
    })
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router,
  originalError: HttpErrorResponse
) {
  // A refresh is already running: queue this request until it finishes, then
  // retry with the freshly minted token instead of starting a second refresh.
  if (isRefreshing) {
    return refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(token => next(withToken(req, token)))
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);

  return auth.refresh().pipe(
    switchMap(() => {
      const token = auth.getToken();
      isRefreshing = false;
      refreshedToken$.next(token);
      // Retry the original request with the new access token. The auth
      // interceptor runs before this one, so it won't re-run on retry —
      // we attach the fresh token here explicitly.
      return token ? next(withToken(req, token)) : throwError(() => originalError);
    }),
    catchError(refreshErr => {
      // Refresh itself failed (expired/invalid refresh token): give up.
      isRefreshing = false;
      auth.logout();
      router.navigate(['/login']);
      return throwError(() => refreshErr);
    })
  );
}
