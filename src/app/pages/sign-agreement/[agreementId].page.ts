import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteMeta } from '@analogjs/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SignAgreementComponent } from '../../components/sign-agreement/sign-agreement.component';

// Route metadata for SEO
export const routeMeta: RouteMeta = {
  title: 'Sign Agreement',
  meta: [
    {
      name: 'description',
      content: 'Sign your rental agreement digitally'
    }
  ]
};

@Component({
  selector: 'app-sign-agreement-page',
  standalone: true,
  imports: [SignAgreementComponent],
  template: `
    @if (agreementId(); as id) {
      <app-sign-agreement [agreementId]="id" />
    } @else {
      <div class="loading-screen">
        <div class="spinner">Loading...</div>
      </div>
    }
  `,
  styles: [`
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.75);
      width: 100dvw;
      height: 100dvh;
    }
    
    .spinner {
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export default class SignAgreementPage {
  private readonly route = inject(ActivatedRoute);
  
  // Extract agreementId from route parameters
  readonly agreementId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('agreementId'))
    )
  );
}