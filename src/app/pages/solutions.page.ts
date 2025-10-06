import { Component } from '@angular/core';
import { SolutionsComponent } from '../components/solutions/solutions.component';

@Component({
  selector: 'app-solutions-page',
  standalone: true,
  imports: [SolutionsComponent],
  template: `
  <app-solutions></app-solutions>`,
})
export default class SolutionsPage {}
