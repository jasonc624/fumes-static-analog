import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GeneratedAgreementComponent } from './generated-agreement.component';
import { sampleEnvelopeData, sampleLegacyTemplate, sampleCustomer, sampleVehicle, sampleReservation } from './test-envelope-data';

@Component({
  selector: 'app-test-generated-agreement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GeneratedAgreementComponent],
  template: `
    <div class="test-container">
      <h1>Generated Agreement Component Test</h1>
      
      <div class="test-section">
        <h2>Test 1: New Envelope Structure (Multiple Agreements)</h2>
        <button (click)="testEnvelopeMode()" class="test-btn">Load Envelope Data</button>
        <div class="component-wrapper">
          <app-generated-agreement
            *ngIf="showEnvelopeTest"
            [envelope]="envelopeData"
            [preview]="false">
          </app-generated-agreement>
        </div>
      </div>

      <div class="test-section">
        <h2>Test 2: Legacy Template Mode (Single Agreement)</h2>
        <button (click)="testLegacyMode()" class="test-btn">Load Legacy Template</button>
        <div class="component-wrapper">
          <app-generated-agreement
            *ngIf="showLegacyTest"
            [template]="legacyTemplate"
            [customer]="customer"
            [vehicle]="vehicle"
            [reservation]="reservation"
            [preview]="false">
          </app-generated-agreement>
        </div>
      </div>

      <div class="test-section">
        <h2>Test 3: Preview Mode</h2>
        <button (click)="testPreviewMode()" class="test-btn">Load Preview Mode</button>
        <div class="component-wrapper">
          <app-generated-agreement
            *ngIf="showPreviewTest"
            [envelope]="envelopeData"
            [preview]="true">
          </app-generated-agreement>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .test-section {
      margin-bottom: 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
    }

    .test-section h2 {
      margin-top: 0;
      color: #333;
    }

    .test-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 20px;
    }

    .test-btn:hover {
      background-color: #0056b3;
    }

    .component-wrapper {
      border: 2px dashed #ccc;
      padding: 20px;
      border-radius: 4px;
      background-color: #f9f9f9;
    }
  `]
})
export class TestGeneratedAgreementComponent {
  envelopeData = sampleEnvelopeData;
  legacyTemplate = sampleLegacyTemplate;
  customer = sampleCustomer;
  vehicle = sampleVehicle;
  reservation = sampleReservation;

  showEnvelopeTest = false;
  showLegacyTest = false;
  showPreviewTest = false;

  testEnvelopeMode() {
    this.showEnvelopeTest = true;
    this.showLegacyTest = false;
    this.showPreviewTest = false;
  }

  testLegacyMode() {
    this.showEnvelopeTest = false;
    this.showLegacyTest = true;
    this.showPreviewTest = false;
  }

  testPreviewMode() {
    this.showEnvelopeTest = false;
    this.showLegacyTest = false;
    this.showPreviewTest = true;
  }
}