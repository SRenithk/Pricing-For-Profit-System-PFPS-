import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './bill-rate/shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./bill-rate/bill-rate.module').then(m => m.BillRateModule) },
  {path:'**',component:PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
