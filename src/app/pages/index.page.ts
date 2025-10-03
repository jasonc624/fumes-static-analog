import { Component } from '@angular/core';
import { OwnersComponent } from '../components/owners/owners';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, OwnersComponent],
  template: `
    <div class="page-container">
      <app-header />
      <landing-owners />
    </div>
  `,
})
export default class HomeComponent {}
