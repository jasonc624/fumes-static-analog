import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: "vanity-page",
  templateUrl: "./vanity-page.component.html",
  styleUrls: ["./vanity-page.component.scss"],
  imports: [CommonModule, MatProgressSpinnerModule],
})
export class VanityPageComponent {
  @Input() vanityPrm: any;
  
  get page() {
    return this.vanityPrm;
  }
  @Input() availability = {
    Monday: "9AM-6pm",
    Tuesday: "9AM-6pm",
    Wednesday: "9AM-6pm",
    Thursday: "9AM-6pm",
    Friday: "9AM-6pm",
    Saturday: "9AM-9pm",
    Sunday: "9AM-9pm",
  };

  get availabilityEntries() {
    return Object.entries(this.availability);
  }

  generateLogo(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  }
}
