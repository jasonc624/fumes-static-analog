import { Component } from '@angular/core';
import { SignAgreementComponent } from '../components/sign-agreement/sign-agreement.component';

@Component({
  selector: 'app-sign-agreement-page',
  standalone: true,
  imports: [SignAgreementComponent],
  template: `
    <app-sign-agreement />
  `,
})
export default class SignAgreementPage {}