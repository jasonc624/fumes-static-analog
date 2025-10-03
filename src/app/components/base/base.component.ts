import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnInit, OnDestroy {
  protected destroyed = new Subject<void>();

  ngOnInit(): void {
    // Base implementation - can be overridden by child components
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}