import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule} from '@angular/common/http'
import { BillRateRoutingModule } from './bill-rate-routing.module';
import { BillRateComponent } from './bill-rate.component';
import { DesiredBillRateComponent } from './desired-bill-rate/desired-bill-rate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { INRCurrencyPipe } from './custom-pipes/inr-currency.pipe';
import { ClipboardModule} from '@angular/cdk/clipboard';
import { INR_Currency } from './shared/Currency-Model/INR';
import { USD_Currency } from './shared/Currency-Model/USD';
import { NgxCaptureModule } from 'ngx-capture';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { TopnavComponent } from './shared/components/topnav/topnav.component';
//<---------------- Angular Material Modules ---------------- \\\>
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatTableModule} from '@angular/material/table';
import { MatSortModule} from '@angular/material/sort';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { MatTooltipModule} from '@angular/material/tooltip';
import  {MatBadgeModule } from '@angular/material/badge';
import { AdminGuard } from './shared/guards/admin.guard';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MatDialogComponent } from './shared/components/mat-dialog/mat-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
//<---------------- Angular Material Modules ---------------- ///>

@NgModule({
  declarations: [
    BillRateComponent,
    DesiredBillRateComponent,
    INRCurrencyPipe,
    SidenavComponent,
    AdminPageComponent,
    TopnavComponent,
    PageNotFoundComponent,
    MatDialogComponent
  ],
  imports: [
    CommonModule,
    BillRateRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    NgxCaptureModule,
    // Angular Material \\\
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule
    // Angular Material ///
    
  ],
  providers:[INR_Currency,USD_Currency,DatePipe,MatSidenav,AdminGuard,]
})
export class BillRateModule { }
