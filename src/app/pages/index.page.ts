import { Component } from '@angular/core';
import { OwnersComponent } from '../components/owners/owners';

@Component({
  selector: 'app-home',
  imports: [ OwnersComponent],
  template: `
    <div class="page-container">
      <landing-owners />
    </div>
  `,
})
export default class HomeComponent {}
