import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface VehicleGuideDialogData {
  title: string;
  icon: string;
  content: string;
}

@Component({
  selector: 'vehicle-guide-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './vehicle-guide-dialog.component.html',
  styleUrl: './vehicle-guide-dialog.component.scss'
})
export class VehicleGuideDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VehicleGuideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VehicleGuideDialogData
  ) {}

  getIconClass(): string {
    switch (this.data.icon) {
      case 'waving_hand': return 'greeting';
      case 'directions_car': return 'directions';
      case 'help_outline': return 'questions';
      default: return '';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}