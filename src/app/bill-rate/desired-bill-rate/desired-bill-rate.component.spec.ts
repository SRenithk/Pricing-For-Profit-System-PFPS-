import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesiredBillRateComponent } from './desired-bill-rate.component';

describe('DesiredBillRateComponent', () => {
  let component: DesiredBillRateComponent;
  let fixture: ComponentFixture<DesiredBillRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesiredBillRateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesiredBillRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
