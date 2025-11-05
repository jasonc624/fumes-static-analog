import { Component, Input, forwardRef, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DigitalSignatureModule } from '@fumes/digital-signature';

@Component({
  selector: 'digital-signature-wrapper',
  standalone: true,
  imports: [DigitalSignatureModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <digital-signature
      #digitalSignature
      [id]="id"
      name="esign"
      [dot]="dot"
      [minWidth]="minWidth"
    ></digital-signature>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DigitalSignatureWrapperComponent),
      multi: true
    }
  ]
})
export class DigitalSignatureWrapperComponent implements ControlValueAccessor, AfterViewInit {
  @Input() id?: string;
  @Input() dot: number = 0.1;
  @Input() minWidth: number = 0.1;
  
  @ViewChild('digitalSignature', { static: false }) digitalSignatureRef!: ElementRef;
  
  private value: any = null;
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private disabled = false;

  ngAfterViewInit() {
    // Set up event listeners for the digital signature component
    if (this.digitalSignatureRef?.nativeElement) {
      const element = this.digitalSignatureRef.nativeElement;
      
      // Listen for signature events if the component emits them
      element.addEventListener('signature-complete', (event: any) => {
        this.onSignatureChange(event.detail);
      });
      
      element.addEventListener('signature-clear', () => {
        this.onSignatureChange(null);
      });
    }
  }

  onSignatureChange(signature: any) {
    this.value = signature;
    this.onChange(signature);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    // If the digital signature component has a method to set the value, call it here
    if (this.digitalSignatureRef?.nativeElement && value) {
      // This would depend on the actual API of the digital-signature component
      // You might need to adjust this based on how the component accepts values
      try {
        this.digitalSignatureRef.nativeElement.setValue?.(value);
      } catch (error) {
        console.warn('Digital signature component does not support setValue method');
      }
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    // If the digital signature component supports disabled state, set it here
    if (this.digitalSignatureRef?.nativeElement) {
      try {
        this.digitalSignatureRef.nativeElement.disabled = isDisabled;
      } catch (error) {
        console.warn('Digital signature component does not support disabled state');
      }
    }
  }
}