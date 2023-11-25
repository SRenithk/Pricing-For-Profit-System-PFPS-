import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateComponent } from './bill-rate.component';

describe('BillRateComponent', () => {
  let component: BillRateComponent;
  let fixture: ComponentFixture<BillRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
