import { Component } from '@angular/core';
import { PrivacyPolicyComponent } from '../components/privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [PrivacyPolicyComponent],
  template: `
    <app-privacy-policy />
  `,
})
export default class PrivacyPage {}