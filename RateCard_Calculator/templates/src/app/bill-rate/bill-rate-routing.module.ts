import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { BillRateComponent } from './bill-rate.component';
import { DesiredBillRateComponent } from './desired-bill-rate/desired-bill-rate.component';
import { AdminGuard } from './shared/guards/admin.guard';

const routes: Routes = 
[
  { path: 'billrate', component: BillRateComponent },
  { path: '', component: DesiredBillRateComponent },
  { path :'admin', component: AdminPageComponent,canActivate:[AdminGuard]}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillRateRoutingModule { }
