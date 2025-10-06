import { Component } from '@angular/core';
import { TosComponent } from '../components/tos/tos.component';


@Component({
  selector: 'app-tos-page',
  standalone: true,
  imports: [TosComponent],
  template: `
    <tos-page />
  `,
})
export default class TosPage {}