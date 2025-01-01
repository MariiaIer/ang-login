import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { ILoginRequest } from '../models-for-requests';
import { IRegistrationRequest } from '../models-for-requests';
import { ILoginResponse } from '../models-response';
import { IMessageResponse } from '../models-response';
import * as UserActions from '../store/user/user.actions';
import { IAuthResponse, IIdToken } from '../model/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store,
  ) {
  }

  public login(formData: ILoginRequest):Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.baseUrl}/auth/login`, formData).pipe(
      map(response => {
        const token = response.token;
        localStorage.setItem('token', token);
        return response;
      })
    );
  }

  public loginWithGoogle(formData: IIdToken):Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/auth/google-login`, formData).pipe(
      map((response: IAuthResponse) => {
        localStorage.setItem('token', response.token);
        return response;
      })
    );
  }

  public register(formData: IRegistrationRequest): Observable<IMessageResponse>{
    return this.http.post<IMessageResponse>(`${this.baseUrl}/auth/register`, formData)
  }

  public logout(): void {
    this.store.dispatch(UserActions.clearUser());
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']).then(() => {
      window.location.reload();
    });
  }

  callCurrentUserFromEffect() {
    this.store.dispatch(UserActions.startLoading());
  }

}
