import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillRateComponent } from './bill-rate.component';
import { DesiredBillRateComponent } from './desired-bill-rate/desired-bill-rate.component';

const routes: Routes = 
[
  { path: 'billrate', component: BillRateComponent },
  { path: '', component: DesiredBillRateComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillRateRoutingModule { }
