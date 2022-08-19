import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, startWith } from 'rxjs';
import { ApiService } from '../shared/api.service';
import { Employee } from '../shared/Employee';
import * as FileSaver from 'file-saver'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


declare var $: any; //for jquery

@Component({
  selector: 'app-desired-bill-rate',
  templateUrl: './desired-bill-rate.component.html',
  styleUrls: ['./desired-bill-rate.component.css']
})
export class DesiredBillRateComponent implements OnInit {

  constructor(private _snackbar:MatSnackBar, 
  private route:Router,
  public service:ApiService,
  private http:HttpClient,
  private toastr: ToastrService) 
  { 
    // this.calculate();
    this.AutoCompleteOptions();
  }

  // Angular Material -------------->
  myControl = new FormControl('');
  //options moved to apiService as Employee_data
  filteredOptions!:Observable<string[]>

  displayFn(user:Employee):string{
    return user && user.name ? user.name: '';
  }

  private _filter(value:string):string[]{
    const filterValue = value.toLowerCase();
    return this.service.Employee_data.filter((option: any)=>option.toLowerCase().includes(filterValue));
    //this.service.Employee_data used instead of options
  }
  // Angular Material //////
  ngOnInit() 
  { 
    this.filteredOptions= this.emp_name!.valueChanges.pipe( 
    // A
    startWith(''),
    map(value=>this._filter(value || '')),
    );
  }

  Emp_name:string ="";
  copy_value:string="";

  //INR 
  ctc_perAnnum_INR    : any ="";
  ctc_perMonth_INR    : any ="";
  ctc_perHour_INR     : any ="";
  tbc_perMonth_INR    : any = "";
  tbc_perHour_INR     : any = "";
  markup_perMonth_INR : any = "";
  markup_perHour_INR  : any = "";
  rbr_perMonth_INR    : any = "";
  rbr_perHour_INR     : any = "";
  Operation_Cost_INR  : number = 50;

  //USD
  ctc_perAnnum_USD    : any ="";
  ctc_perMonth_USD    : any ="";
  ctc_perHour_USD     : any ="";
  tbc_perMonth_USD    : any = "";
  tbc_perHour_USD     : any = "";
  markup_perMonth_USD : any = "";
  markup_perHour_USD  : any = "";
  rbr_perMonth_USD    : any = "";
  rbr_perHour_USD     : any = "";
  Operation_Cost_USD  : number = 1;


  // USD values
  USD_value:boolean=false;

  INR()
  {
    this.USD_value = false;
    this.copy_value=
      `Employee Name : ` + this.Emp_name + `\n\n` +
      //INR
      `CTC per Annum                    : ₹` + this.ctc_perAnnum_INR      + `\n`    +
      `CTC per Month                    : ₹` + this.ctc_perMonth_INR      + `\n`    +
      `CTC per Hour                     : ₹` + this.ctc_perHour_INR       + `\n\n`  +
  
      `Total Base Cost per Month        : ₹` + this.tbc_perMonth_INR      +`\n`     +
      `Total Base Cost per Hour         : ₹` + this.tbc_perHour_INR       +`\n\n`   +
  
      `Markup per Month                 : ₹` + this.markup_perMonth_INR   +`\n`     +
      `Markup per Hour                  : ₹` + this.markup_perHour_INR    +`\n\n`   +
  
      `Recommended Bill Rate per Month  : ₹` + this.rbr_perMonth_INR      +`\n`     +
      `Recommended Bill Rate per Hour   : ₹` + this.rbr_perHour_INR       +`\n\n`   
      // Export
      this.exportList = [
      { Name: this.Emp_name, Basis: 'Per Annum', CTC: '₹'+this.ctc_perAnnum_INR, Total_Base_Cost : '', Markup :'', Recommended_Bill_Rate:'','':''},
      { Name: '', Basis: 'Per Month', CTC: '₹'+this.ctc_perMonth_INR, Total_Base_Cost : '₹'+this.tbc_perMonth_INR, Markup : '₹'+this.markup_perMonth_INR, Recommended_Bill_Rate : '₹'+this.rbr_perMonth_INR},
      { Name: '', Basis: 'Per Hour', CTC: '₹'+this.ctc_perHour_INR, Total_Base_Cost : '₹'+this.tbc_perHour_INR, Markup : '₹'+this.markup_perHour_INR, Recommended_Bill_Rate : '₹'+this.rbr_perHour_INR}
    ]
  }
  USD()
  {
    this.USD_value = true;
    this.copy_value=
      `Employee Name : ` + this.Emp_name + `\n\n` +

      `CTC per Annum                    : $` + this.ctc_perAnnum_USD      + `\n`    +
      `CTC per Month                    : $` + this.ctc_perMonth_USD      + `\n`    +
      `CTC per Hour                     : $` + this.ctc_perHour_USD       + `\n\n`  +
  
      `Total Base Cost per Month        : $` + this.tbc_perMonth_USD      +`\n`     +
      `Total Base Cost per Hour         : $` + this.tbc_perHour_USD       +`\n\n`   +
  
      `Markup per Month                 : $` + this.markup_perMonth_USD   +`\n`     +
      `Markup per Hour                  : $` + this.markup_perHour_USD    +`\n\n`   +
  
      `Recommended Bill Rate per Month  : $` + this.rbr_perMonth_USD      +`\n`     +
      `Recommended Bill Rate per Hour   : $` + this.rbr_perHour_USD       +`\n`   
        this.exportList = [
        { Name: this.Emp_name, Basis: 'Per Annum', CTC: '$'+this.ctc_perAnnum_USD, Total_Base_Cost : '', Markup :'', Recommended_Bill_Rate:'','':''},
        { Name: '', Basis: 'Per Month', CTC: '$'+this.ctc_perMonth_USD, Total_Base_Cost : '$'+this.tbc_perMonth_USD, Markup : '$'+this.markup_perMonth_USD, Recommended_Bill_Rate : '$'+this.rbr_perMonth_USD},
        { Name: '', Basis: 'Per Hour', CTC: '$'+this.ctc_perHour_USD, Total_Base_Cost : '$'+this.tbc_perHour_USD, Markup : '$'+this.markup_perHour_USD, Recommended_Bill_Rate : '$'+this.rbr_perHour_USD}
      ]
  }

  calculate()
  {
    
    if(this.emp_name?.value!=null && this.emp_name?.value!="" && this.ctc?.value!=null && this.t_hours?.value!=null)
    {
      this.service.getAllData().subscribe(res=>
        {
          console.log(res.length == 0)
        })
      // this.http.delete('http://localhost:3000/Desired-billrate/1').subscribe(res=>console.log(res))
      this.http.post('http://localhost:3000/Desired-billrate',this.CalculateForm.getRawValue(),{withCredentials:true}).subscribe(
      res=>console.log(res)
      ); 
      this.Emp_name = this.emp_name.value;
      // .substring(0, this.emp_name.value.indexOf(' '));
      this.ctc_perAnnum_INR = Number(this.ctc?.value);
      this.ctc_perAnnum_USD = Math.round(Number(this.ctc?.value)/75);

      this.ctc_perMonth_INR =Math.round(this.ctc_perAnnum_INR/12)
      this.ctc_perMonth_USD =Math.round((this.ctc_perAnnum_INR/12)/75)
      this.ctc_perHour_INR = Math.round((Number(this.ctc?.value)/12)/Number(this.t_hours?.value))
      this.ctc_perHour_USD = Math.round(((Number(this.ctc?.value)/12)/Number(this.t_hours?.value))/75)

      this.tbc_perHour_INR = this.ctc_perHour_INR + this.Operation_Cost_INR;
      this.tbc_perHour_USD = this.ctc_perHour_USD + this.Operation_Cost_USD;
      this.tbc_perMonth_INR = Math.round(this.tbc_perHour_INR * Number(this.t_hours.value));
      this.tbc_perMonth_USD = Math.round(this.tbc_perMonth_INR / 75);

      this.markup_perHour_INR = this.ctc_perHour_INR + this.Operation_Cost_INR;
      this.markup_perHour_USD = this.ctc_perHour_USD + this.Operation_Cost_USD;
      this.markup_perMonth_INR = Math.round(this.markup_perHour_INR * Number(this.t_hours.value));
      this.markup_perMonth_USD = Math.round(this.markup_perMonth_INR / 75);

      this.rbr_perHour_INR = this.tbc_perHour_INR * 2;
      this.rbr_perHour_USD = this.tbc_perHour_USD * 2 ;
      this.rbr_perMonth_INR = Math.round(this.rbr_perHour_INR * Number(this.t_hours.value));
      this.rbr_perMonth_USD = Math.round(this.rbr_perMonth_INR / 75);
      
      console.log(this.service.Employee_data.find(user => user == this.emp_name?.value));
      this.toastr.success("Data Added Successfully");

      //to trigger python url
      $(document).ready(function(){
        setTimeout(function() {
          $('#myHiddenPage').load('http://127.0.0.1:5000/price');
          },500);
      });

    }
    if(!this.USD_value)
    {
      this.copy_value=
      `Employee Name : ` + this.Emp_name + `\n\n` +
      //INR
      `CTC per Annum                    : ₹` + this.ctc_perAnnum_INR      + `\n`    +
      `CTC per Month                    : ₹` + this.ctc_perMonth_INR      + `\n`    +
      `CTC per Hour                     : ₹` + this.ctc_perHour_INR       + `\n\n`  +
  
      `Total Base Cost per Month        : ₹` + this.tbc_perMonth_INR      +`\n`     +
      `Total Base Cost per Hour         : ₹` + this.tbc_perHour_INR       +`\n\n`   +
  
      `Markup per Month                 : ₹` + this.markup_perMonth_INR   +`\n`     +
      `Markup per Hour                  : ₹` + this.markup_perHour_INR    +`\n\n`   +
  
      `Recommended Bill Rate per Month  : ₹` + this.rbr_perMonth_INR      +`\n`     +
      `Recommended Bill Rate per Hour   : ₹` + this.rbr_perHour_INR       +`\n\n`   

      // Export
    this.exportList = [
      { Name: this.Emp_name, Basis: 'Per Annum', CTC: '₹'+this.ctc_perAnnum_INR, Total_Base_Cost : '', Markup :'', Recommended_Bill_Rate:'','':''},
      { Name: '', Basis: 'Per Month', CTC: '₹'+this.ctc_perMonth_INR, Total_Base_Cost : '₹'+this.tbc_perMonth_INR, Markup : '₹'+this.markup_perMonth_INR, Recommended_Bill_Rate : '₹'+this.rbr_perMonth_INR},
      { Name: '', Basis: 'Per Hour', CTC: '₹'+this.ctc_perHour_INR, Total_Base_Cost : '₹'+this.tbc_perHour_INR, Markup : '₹'+this.markup_perHour_INR, Recommended_Bill_Rate : '₹'+this.rbr_perHour_INR}
    ]
    }
    else if(this.USD_value)
    {
      this.copy_value=
      `Employee Name : ` + this.Emp_name + `\n\n` +

      `CTC per Annum                    : $` + this.ctc_perAnnum_USD      + `\n`    +
      `CTC per Month                    : $` + this.ctc_perMonth_USD      + `\n`    +
      `CTC per Hour                     : $` + this.ctc_perHour_USD       + `\n\n`  +
  
      `Total Base Cost per Month        : $` + this.tbc_perMonth_USD      +`\n`     +
      `Total Base Cost per Hour         : $` + this.tbc_perHour_USD       +`\n\n`   +
  
      `Markup per Month                 : $` + this.markup_perMonth_USD   +`\n`     +
      `Markup per Hour                  : $` + this.markup_perHour_USD    +`\n\n`   +
  
      `Recommended Bill Rate per Month  : $` + this.rbr_perMonth_USD      +`\n`     +
      `Recommended Bill Rate per Hour   : $` + this.rbr_perHour_USD       +`\n`   
      // Export
      this.exportList = [
        { Name: this.Emp_name, Basis: 'Per Annum', CTC: '$'+this.ctc_perAnnum_USD, Total_Base_Cost : '', Markup :'', Recommended_Bill_Rate:'','':''},
        { Name: '', Basis: 'Per Month', CTC: '$'+this.ctc_perMonth_USD, Total_Base_Cost : '$'+this.tbc_perMonth_USD, Markup : '$'+this.markup_perMonth_USD, Recommended_Bill_Rate : '$'+this.rbr_perMonth_USD},
        { Name: '', Basis: 'Per Hour', CTC: '$'+this.ctc_perHour_USD, Total_Base_Cost : '$'+this.tbc_perHour_USD, Markup : '$'+this.markup_perHour_USD, Recommended_Bill_Rate : '$'+this.rbr_perHour_USD}
        ]
    }
  }
  clear()
  {
    this.CalculateForm.reset();
    this.Emp_name="";
    //INR
    this.ctc_perAnnum_INR = "";
    this.ctc_perMonth_INR = "";
    this.ctc_perHour_INR = "";
    //USD
    this.ctc_perAnnum_USD = "";
    this.ctc_perMonth_USD = "";
    this.ctc_perHour_USD = "";
  }

  CalculateForm = new FormGroup({
    emp_name : new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      // Validators.pattern('[a-zA-Z ]+$')
      // [a-zA-Z ]+$
    ]),
    ctc: new FormControl('',[
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ]),
    markup: new FormControl('100',
    [
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ]),
    t_hours: new FormControl('176',[
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ])
  })
  get emp_name() { return this.CalculateForm.get('emp_name'); }
  get ctc() { return this.CalculateForm.get('ctc'); }
  get markup() { return this.CalculateForm.get('markup'); }
  get t_hours() { return this.CalculateForm.get('t_hours'); }

  snackbar()
  {
    this._snackbar.open('Copied to Clipboard!','',{duration: 1500});
  }
  length()
  {
    if(this.emp_name?.value!=null && this.emp_name?.value?.length > 2)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  AutoCompleteOptions()
  {
    if(this.service.Employee_data.find(user => user == this.emp_name?.value))
    {
      return true;
    }else{
      return false;
    }
  }

  //File Saver
  exportList: any[] = [];

  exportExcel() 
  {
    if (this.exportList.length > 0) 
    {
      import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.exportList);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "Rate Card - "+this.Emp_name);
      });
    }
  }
  saveAsExcelFile(buffer: any, fileName: string): void 
  {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + ' - ' + new Date().toJSON().slice(0,10).replace(/-/g,'/') + EXCEL_EXTENSION);
  }
}
 