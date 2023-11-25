import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent implements OnInit {

  constructor(
    public route    : Router,
    public service  : ApiService) { }
  ngOnInit(): void {
    this.service.PendingApprovalLength();
    if(this.service.isViewSubCalcutions && this.route.url == '/')
    {this.currencyChecked();}
  }

  dark            : boolean = false;

  @ViewChild('INR_val') isINR !: ElementRef;
  @ViewChild('USD_val') isUSD !: ElementRef;
  
  @Input()//For SideNav open
  sideNav_Parent!:any;

  @Output()//To pass INR and USD checked event
  IsCheckedEmitter:EventEmitter<any>=new EventEmitter();

  INR(){ this.IsCheckedEmitter.emit("INR"); } //pass the click event
  USD(){ this.IsCheckedEmitter.emit("USD"); } //pass the click event
  
  open(data:any)
  {
    console.log("opened")
    data.toggle();
  }

  currencyChecked()
  {
    switch (this.service.ViewSubCalculations_data.currency_type)
    {
      case "INR":
        setTimeout(() => {
          this.isINR.nativeElement.checked = true;
        }, 10);
      break;
      case "USD":
        setTimeout(() => {
          this.isUSD.nativeElement.checked = true;
        }, 10);
      break;
    }
  }
  isAD_or_HO_Btn()
  {
    switch(localStorage.getItem("data3"))
    {
      case "Admin" :
      return "AD"
      case "Higher Official":
      return "HO"
      case null :
      return "NO"
    }
    return
  }
}
