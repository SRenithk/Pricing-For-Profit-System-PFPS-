import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule} from '@angular/common/http'

import { BillRateRoutingModule } from './bill-rate-routing.module';
import { BillRateComponent } from './bill-rate.component';
import { DesiredBillRateComponent } from './desired-bill-rate/desired-bill-rate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { INRCurrencyPipe } from './custom-pipes/inr-currency.pipe';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    BillRateComponent,
    DesiredBillRateComponent,
    INRCurrencyPipe
  ],
  imports: [
    CommonModule,
    BillRateRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ClipboardModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  providers:[]
})
export class BillRateModule { }
