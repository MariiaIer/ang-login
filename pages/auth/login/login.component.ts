import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, mergeMap } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as UserActions from '../../../data/store/user/user.actions';
import { userLoadingSelector } from '../../../data/store/user/user.selectors';
import { AuthService, NotificationService, NotificationType } from '../../../data/services';
import { ScriptLoaderService } from '../../../data/services/scriptLoader';
import { IAuthResponse, IGoogleAuthResponse, IIdToken } from '../../../data/model/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GoogleSigninButtonModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  public formData = {
    email: '',
    password: ''
  };
  public isLoading$: Observable<boolean> = this.store.pipe(select(userLoadingSelector));

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private store: Store,
    private authServiceGoogle: SocialAuthService,
    private scriptLoader: ScriptLoaderService
  ) {
  }

  ngOnInit(): void {
    this.loadGoogleSignInScript();
    this.authServiceGoogle.authState.pipe(
      mergeMap((user: IGoogleAuthResponse) => {
        const dataToSend: IIdToken = {
          idToken: user.idToken
        }
        return this.authService.loginWithGoogle(dataToSend)
      })
    ).subscribe({
      next: (data: IAuthResponse) => {
        this.store.dispatch(UserActions.addUser({user: data.user}));
        this.router.navigate(['']);
      },
      error: (error) => {
        console.log(error)
      }
    });
  }

  public onSubmit(): void {
    this.store.dispatch(UserActions.startLoading());

    this.authService.login(this.formData).subscribe({
      next: () => {
        this.store.dispatch(UserActions.stopLoading());
        this.notificationService.showNotification('Success', NotificationType.SUCCESS);
        this.router.navigate(['']);
      },
      error: response => {
        this.notificationService.showNotification(response?.error?.message, NotificationType.ERROR);
      }
    });
  }

  private loadGoogleSignInScript(): void {
    this.scriptLoader.loadScript('googleAccountScript', 'https://accounts.google.com/gsi/client')
      .then(data => {
        console.log('Script loaded successfully', data);
      })
      .catch(error => console.error('Script loading failed', error));
  }

}
