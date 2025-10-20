import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VanityPage } from '../../models/vanity-page.model';

@Component({
  standalone: true,
  selector: "app-brand-page-preview",
  templateUrl: "./brand-page-preview.component.html",
  styleUrls: ["./brand-page-preview.component.scss"],
  imports: [CommonModule, MatProgressSpinnerModule]
})
export class BrandPagePreviewComponent {
  @Input() vanityPrm: any | null = null;
  
  // Tab management
  activeTab: string = 'rent';
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  

  get businessHours(): any | undefined {
    return this.vanityPrm?.companyDetails?.businessHours?.schedule;
  }

  get availabilityEntries(): [string, string][] {
    if (this.businessHours) {
      return Object.entries(this.businessHours);
    }
    // Fallback to default hours if not provided
    const defaultHours: any = {
      Monday: "9AM-6pm",
      Tuesday: "9AM-6pm",
      Wednesday: "9AM-6pm",
      Thursday: "9AM-6pm",
      Friday: "9AM-6pm",
      Saturday: "9AM-9pm",
      Sunday: "9AM-9pm",
    };
    return Object.entries(defaultHours);
  }

  generateLogo(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  }
}
