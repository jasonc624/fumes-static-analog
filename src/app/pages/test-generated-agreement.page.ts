import { Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { TestGeneratedAgreementComponent } from '../components/generated-agreement/test-generated-agreement.component';

// Route metadata for SEO
export const routeMeta: RouteMeta = {
  title: 'Test Generated Agreement Component',
  meta: [
    {
      name: 'description',
      content: 'Test page for the refactored Generated Agreement component'
    }
  ]
};

@Component({
  selector: 'app-test-generated-agreement-page',
  standalone: true,
  imports: [TestGeneratedAgreementComponent],
  template: `
    <app-test-generated-agreement></app-test-generated-agreement>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
  `]
})
export default class TestGeneratedAgreementPage {
}