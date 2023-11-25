import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, forkJoin, map, Observable, switchMap } from 'rxjs';
import { ApiService } from '../shared/api.service';
// import { Employee } from '../shared/Employee';
import * as FileSaver from 'file-saver'
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { INR_Currency } from '../shared/Currency-Model/INR';
import { USD_Currency } from '../shared/Currency-Model/USD';
// import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import domtoimage from 'dom-to-image';
import { copyImageToClipboard } from 'copy-image-clipboard'
import * as CryptoJS from 'crypto-js'; // dont remove this
import { MatSidenav } from '@angular/material/sidenav';


@Component({
  selector: 'app-desired-bill-rate',
  templateUrl: './desired-bill-rate.component.html',
  styleUrls: ['./desired-bill-rate.component.css']
})
export class DesiredBillRateComponent implements OnInit {
  
  constructor(
    public    service       : ApiService,
    private   toastr        : ToastrService,
    public    Rupee         : INR_Currency,
    public    USDollar      : USD_Currency,
    public    date          : DatePipe,
    public    A_route       : ActivatedRoute,
    private   route         : Router,
    public    sideNav       : MatSidenav
    )
    { }
    Emp_name        : any  = "";
    ctc_num         : any     = "";
    dark            : boolean = false;
    save_btn        : boolean = false; 
    clr_btn         : boolean = false;
    Currency_val    : string  = "INR";      //default boolean will be INR
    Symbol          : string  = "₹";
    exportList      : any[] = [];           // For export to excel
    filteredOptions !:Observable<string[]> //autocomplete


    //Common
    ctc_perAnnum        : any = "";
    ctc_perMonth        : any = "";
    ctc_perHour         : any = "";
    tbc_perMonth        : any = "";
    tbc_perHour         : any = "";
    markup_perMonth     : any = "";
    markup_perHour      : any = "";
    rbr_perMonth        : any = "";
    rbr_perHour         : any = "";
    C_Logic             : number = 1; //default for INR
    O_cost_INR_DB_value!: number;
    O_cost_USD_DB_value!: number;
    O_cost_INR         !: number;
    O_cost_USD         !: number;
    Operation_Cost     !: number;     // will assign value in ngOnInit
    USD_Logic          !: number;     //conversion

    //Tooltip
    Tooltip_CTC       : string = "";
    Tooltip_TBC       : string = "";
    Tooltip_Markup    : string = "";
    Tooltip_RBR       : string = "";

    //Tabs
    IKBR_Tab          : boolean = false;
    DBR_Tab           : boolean = true;
    BC_Tab            : boolean = false;

    //CountDown
    Timer     : number = 3;
    Timeout   : any;
    Interval  : any;
    IKBR_Btn  : boolean = false;
    BC_Btn    : boolean = false;

    @ViewChild('screen') screen : any;  //image capture
    
    Call_GetCurrencyFromChild(event:any)
    {
      this.USD_Logic = event; // value
      this.calculate(false);
    }
    Call_GetOperationCost_INR_FromChild(event:any)
    {
      this.O_cost_INR = Number(event); // 50
      if(this.Currency_val == "INR")
      { this.Operation_Cost = this.O_cost_INR; }
      this.calculate(false);
    }
    Call_GetOperationCost_USD_FromChild(event:any)
    {
      this.O_cost_USD = Number(event); // 1
      if(this.Currency_val == "USD")
      { this.Operation_Cost = this.O_cost_USD; }
      this.calculate(false);
    }
    OnInit_getCurrencyFromService()
    {
      this.service.getCurrencyValue().subscribe(res=>
      { 
        if(Object.values(res).find(x=>x.ConversionType == "USD_INR") &&
            !this.service.isViewSubCalcutions) //the Conversion rate not to be assigned initially.
        {
        this.USD_Logic = Object.values(res)[0].ConversionValue; 
        } else if (this.service.isViewSubCalcutions)
        {
          this.USD_Logic = Number(this.CalculateForm.value.currency_conversion_rate);
        }
      })
    }
    OnInit_getOperationCostFromService()
    {
      this.service.getOperationCostValue().subscribe(res=>
        {
          this.O_cost_INR_DB_value = Number(Object.values(res).find(x=>x.CurrencyType == "INR").OperationCost_Value);
          this.O_cost_USD_DB_value = Number(Object.values(res).find(x=>x.CurrencyType == "USD").OperationCost_Value);
          //While switching hits OnInit and Initial O_cost will based on type of currency
          switch(this.service.isViewSubCalcutions+''+ this.CalculateForm.value.currency_type)
          {
            case false+''+'': //currency type = '' initially
              this.O_cost_INR = this.O_cost_INR_DB_value;
              this.O_cost_USD = this.O_cost_USD_DB_value;
              this.Operation_Cost = this.O_cost_INR;  // INR at OnInit
            break;
            case true+''+"INR":
              this.O_cost_INR = Number(this.CalculateForm.value.operation_cost_value ?? 0); //fetch from data
              //db value. coz, another currency operation cost not be stored , so fetch the currentone
              this.O_cost_USD = this.O_cost_USD_DB_value;
              this.Operation_Cost = this.O_cost_INR;  //for calculation
              this.calculate(false);
              this.IsChecked("INR"); 
            break;
            case true+''+"USD":
              this.O_cost_INR = this.O_cost_INR_DB_value;
              this.O_cost_USD = Number(this.CalculateForm.value.operation_cost_value ?? 0);
              this.Operation_Cost = this.O_cost_USD;  
              this.calculate(false);
              this.IsChecked("USD");  // To display USD value Calculation while navigating from admin page
            break;
          }
        })
    }
    //To Calculate the values (User changes from INR to USD (dropdown) and vice versa) in Top Nav
    IsChecked(event:any)
    {
      if(event=="INR")
      {
        this.C_Logic = 1;
        this.Operation_Cost = this.O_cost_INR;   // 50
        this.Symbol = "₹" ;
        this.Currency_val = "INR"; //will be used as boolean for more than two values
        if(this.ctc_num!="")
        { this.calculate(false); }
        if(this.CalculateForm.controls['currency_type'].value == "INR")
        {
          this.save_btn = true;
        }else
        {
          this.save_btn=false;
        }
      }
      else if(event=="USD")
      {
        this.C_Logic =  this.USD_Logic;         //changed from 75
        this.Operation_Cost = this.O_cost_USD;  //1
        this.Symbol = "$" ;
        this.Currency_val = "USD"; 
        if(this.ctc_num!="")
        { this.calculate(false); }
        if(this.CalculateForm.controls['currency_type'].value == "USD")
        {
          this.save_btn = true;
        }else
        {
          this.save_btn=false;
        }
      }
    }

    //Angular Material - AutoComplete 
    //Two methods moved to api.service for maintain all api requests in service file
    generatefilteredOptions()
    {
      this.filteredOptions= this.emp_name!.valueChanges.pipe(
      debounceTime(30),                   // time that data shows after the response
      filter(val => val!.length >= 2),    // requires minimum 2 characters
      switchMap(value=>this.service.getEmployeeData(value || '')),
      );
    }

    assignValue_ViewSubCalc()
    {
      this.CalculateForm.setValue({
        date_time: this.service.ViewSubCalculations_data.date_time,
        currency_type: this.service.ViewSubCalculations_data.currency_type,
        ctc: (this.service.ViewSubCalculations_data.ctc).toString(),
        emp_name: this.service.ViewSubCalculations_data.emp_name,
        markup: (this.service.ViewSubCalculations_data.markup).toString(),
        t_hours: (this.service.ViewSubCalculations_data.t_hours).toString(),
        operation_cost_value: (this.service.ViewSubCalculations_data.operation_cost_value).toString(),
        currency_conversion_rate: (this.service.ViewSubCalculations_data.currency_conversion_rate).toString(),
      });
    }
  
    ngOnInit() 
    { 
      if(this.service.isViewSubCalcutions) { this.assignValue_ViewSubCalc(); }
      this.OnInit_getCurrencyFromService();         //fetch data initially for calculation
      this.OnInit_getOperationCostFromService();    //fetch data initially for calculation
      this.generatefilteredOptions();               //filter values on each keypress
      this.passValues_route();                      //Passing Param values for Employee Name & CTC
    }

    passValues_route()
    {
      this.A_route.queryParams.subscribe(params => {
        if(Object.values(params).length != 0 )
        {
          this.CalculateForm.controls['emp_name'] .setValue(params['CandidateName'])
          this.CalculateForm.controls['ctc']      .setValue(params['CTC'])
          this.clr_btn = true;
          //To clear the params after assinging values
          this.route.navigate([], {
            relativeTo: this.A_route,
            queryParamsHandling: null
          });
        }
      });
    }
    CalculateForm = new FormGroup({
      emp_name : new FormControl('',[
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z ]*$') // Not required if Custom names not allowed
      ]),
      ctc: new FormControl('',[
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      markup: new FormControl('',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      t_hours: new FormControl('',[
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      //Current_time
      date_time    : new FormControl('',[]),
      operation_cost_value : new FormControl(0,[]) ,
      currency_conversion_rate : new FormControl(0,[]) ,
      //Type_of_Currency
      currency_type: new FormControl('',[]), //required to enable and disable submit button
    })

    get emp_name()  { return this.CalculateForm.get('emp_name');  }
    get ctc()       { return this.CalculateForm.get('ctc');       }
    get markup()    { return this.CalculateForm.get('markup');    }
    get t_hours()   { return this.CalculateForm.get('t_hours');   }

    dark_theme()    { this.dark = true;  }
    light_theme()   { this.dark = false; }

    calculate(clicked : any)
    {
      if(this.ctc_perAnnum !="" || clicked || this.service.isViewSubCalcutions)   // Initially clicked, At mid of calculation ctc_perAnnum not be empty string
      {
        this.Emp_name = this.emp_name?.value; // .substring(0, this.emp_name.value.indexOf(' '))  // - To display only the firstname;
        this.CalculateForm.controls['date_time'].setValue(this.date.transform((new Date),this.service.dateFormat));
        //After changing INR from dropdown and clicking Calculate button
        if(this.Currency_val=="INR" && clicked || 
          this.service.isViewSubCalcutions && this.CalculateForm.value.currency_type == "INR") 
        { 
          //Given value (85000) / 1 => ctc_num = 85000 (if INR)
          this.ctc_num =  Number(this.ctc?.value) // before / this.C_Logic;
          this.CalculateForm.controls['currency_type'].setValue("INR");  //Enable/Disable Submit Button
        }
        //After changing USD from dropdown and clicking Calculate button
        else if(this.Currency_val=="USD" && clicked || 
        this.service.isViewSubCalcutions && this.CalculateForm.value.currency_type == "USD")
        { 
          //Given value (85000) * 75 => ctc_num = 6375000 (If USD)
          this.ctc_num =  Number(this.ctc?.value) * this.C_Logic; 
          this.CalculateForm.controls['currency_type'].setValue("USD");  //Enable/Disable Submit Button
        }

          //Currency_val -> when we choose value from Currency dropdown
          //Type of Currency -> In which currency the calculate btn is pressed.
          switch (this.Currency_val + '' +this.CalculateForm.value.currency_type) { 
          case "INR" +''+ "INR":
            this.C_Logic = 1;
          break;
          case "USD" +''+ "INR":
            this.C_Logic = this.USD_Logic;
          break;
          case "USD" +''+ "USD":
            this.C_Logic = this.USD_Logic;
            //To Keep the USD values static and keep change on INR values.
            this.ctc_num =  Number(this.ctc?.value) * this.USD_Logic; 
          break;
          case "INR" +''+ "USD":
            this.C_Logic = 1;
            //To Keep the USD values static and keep change on INR values.
            this.ctc_num =  Number(this.ctc?.value) * this.USD_Logic; 
          break;
      }
        // Calculations
        //If INR => 85000 / 1     = 85000
        //If USD => 6375000 / 75  = 85000 
        this.ctc_perAnnum         =   (this.ctc_num/this.C_Logic).toFixed(2)

        this.ctc_perMonth         =   (( this.ctc_perAnnum/12)).toFixed(2)
        this.ctc_perHour          =   (((this.ctc_perAnnum/12))  / Number(this.t_hours?.value)).toFixed(2)
                         
        this.tbc_perMonth         =   (((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value)) ).toFixed(2)
        this.tbc_perHour          =   ((((this.ctc_perAnnum/12)) / Number(this.t_hours?.value)) + this.Operation_Cost  ).toFixed(2)
        //                            ( ----- Markup value / 100 ------ ) * ( -------------------------------- Total Base Cost-------------------------------------------------------------------------- )
        this.markup_perMonth      =   (( Number(this.markup?.value)/100 ) * (((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value))) ).toFixed(2)
        this.markup_perHour       =   (((Number(this.markup?.value)/100 ) * (((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) ).toFixed(2)
        //                            ( --------------------- Markup Per Month -------------------------------------------------------------------------------------- ) / ( --------- THPM --------- )
        this.rbr_perMonth         =   ((((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value))) + ((Number(this.markup?.value)/100 ) * (((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value))))).toFixed(2)
        this.rbr_perHour          =   (((((this.ctc_perAnnum/12)) / Number(this.t_hours?.value)) + this.Operation_Cost  ) + (((Number(this.markup?.value)/100 ) * (((this.ctc_perAnnum/12))  + (this.Operation_Cost * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) )).toFixed(2)
        //                             toFixed will be change number to string, so converting to Number to toFixed again
        if(clicked)
        { 
          this.save_btn=true;
          //To save a new Employee name while clicking calculate Btn
          this.service.getEmployees().subscribe(res=>
            {
              this.toastr.info("Calculated Successfully"); 
              if(!Object.values(res).find(x=>x.employee_name == this.CalculateForm.value.emp_name))
              {
                var data = 
                {
                  // "id":0, //not needed
                  "employee_name" : this.CalculateForm.value.emp_name
                }
                this.service.postData = data;
                this.service.postEmployees().subscribe(res=>{console.log(res)})
              }
            },
            ()=>{
                this.toastr.error("Something Error Happened");
            })
        }
        this.INR_DB();
        this.USD_DB();
      }

      // Export
      this.exportList = 
      [
        { Name: this.Emp_name,  Basis: 'Per Annum', CTC: ''+this.Symbol+ this.ctc_perAnnum, Total_Base_Cost : ''                    , Markup :''                        , Recommended_Bill_Rate:'','':''                 },
        { Name: '',             Basis: 'Per Month', CTC: ''+this.Symbol+ this.ctc_perMonth, Total_Base_Cost : ''+this.Symbol+ this.tbc_perMonth, Markup : ''+this.Symbol+ this.markup_perMonth, Recommended_Bill_Rate : ''+this.Symbol+ this.rbr_perMonth },
        { Name: '',             Basis: 'Per Hour' , CTC: ''+this.Symbol+ this.ctc_perHour , Total_Base_Cost : ''+this.Symbol+ this.tbc_perHour , Markup : ''+this.Symbol+ this.markup_perHour , Recommended_Bill_Rate : ''+this.Symbol+ this.rbr_perHour  }
      ]   

      //Tooltip
      this.Tooltip_CTC    = "CTC per Annum ("+ this.ctc_perAnnum +") / 12 = CTC per Month (" + this.ctc_perMonth + ") \n\n CTC per Month(" + this.ctc_perMonth + ") / Total Hours per Month (" + Number(this.t_hours?.value) + ") = CTC Per Hour (" + this.ctc_perHour +")"
      this.Tooltip_TBC    = "CTC per Month (" + this.ctc_perMonth + ") + Operation Cost per Month ("+this.Operation_Cost + " * " +Number(this.t_hours?.value) +" = "+ this.Operation_Cost * Number(this.t_hours?.value) + ") = Total Base Cost per Month(" + this.tbc_perMonth + ") \n\n CTC per Hour ("+ this.ctc_perHour +") + Operation Cost per Hour ("+ this.Operation_Cost +") = Total Base Cost Per Hour("+ this.tbc_perHour +")"
      this.Tooltip_Markup = "Entered Markup(%) ("+ Number(this.markup?.value)+ ") of Total Base Cost per Month ("+ this.tbc_perMonth +") = Markup per Month ("+ this.markup_perMonth +") \n\n Markup per Month ("+ this.markup_perMonth+ ") / Total Hours Per Month ("+ Number(this.t_hours?.value) +") = Markup per Hour ("+ this.markup_perHour + ")"
      this.Tooltip_RBR    = "Total Base Cost per Month ("+ this.tbc_perMonth +") + Markup per Month ("+ this.markup_perMonth +") = Recommended Bill Rate per Month ("+ this.rbr_perMonth +") \n\n Total Base Cost per Hour ("+ this.tbc_perHour +") + Markup per Hour ("+ this.markup_perHour +") = Recommended Bill Rate per Hour ("+ this.rbr_perHour +")" 
    }
    INR_DB()
    {
      this.Rupee.ctc_per_Annum                      = Number((this.ctc_num/1).toFixed(2));  //instead of 1 (INR_Logic) before
      this.Rupee.ctc_per_Month                      = Number((( this.Rupee.ctc_per_Annum/12)).toFixed(2));
      this.Rupee.ctc_per_Hour                       = Number((((this.Rupee.ctc_per_Annum/12))  / Number(this.t_hours?.value)).toFixed(2));
      this.Rupee.total_basecost_per_Month           = Number((((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value)) ).toFixed(2));
      this.Rupee.total_basecost_per_Hour            = Number(((((this.Rupee.ctc_per_Annum/12)) / Number(this.t_hours?.value)) + this.O_cost_INR  ).toFixed(2));
      this.Rupee.markup_per_Month                   = Number(((Number(this.markup?.value)/100 ) * (((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value))) ).toFixed(2));
      this.Rupee.markup_per_Hour                    = Number((((Number(this.markup?.value)/100 ) * (((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) ).toFixed(2));  
      this.Rupee.recommended_billrate_per_Month     = Number(((((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value))) + ((Number(this.markup?.value)/100 ) * (((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value))))).toFixed(2)); 
      this.Rupee.recommended_billrate_per_Hour      = Number((((((this.Rupee.ctc_per_Annum/12)) / Number(this.t_hours?.value)) + this.O_cost_INR  ) + (((Number(this.markup?.value)/100 ) * (((this.Rupee.ctc_per_Annum/12))  + (this.O_cost_INR * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) )).toFixed(2));  
      this.Rupee.operation_cost_per_Hour            = this.O_cost_INR
    }
    USD_DB()
    { 
      this.USDollar.ctc_per_Annum                   = Number((this.ctc_num/this.USD_Logic).toFixed(2));
      this.USDollar.ctc_per_Month                   = Number((( this.USDollar.ctc_per_Annum/12)).toFixed(2));
      this.USDollar.ctc_per_Hour                    = Number((((this.USDollar.ctc_per_Annum/12))  / Number(this.t_hours?.value)).toFixed(2));
      this.USDollar.total_basecost_per_Month        = Number((((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value)) ).toFixed(2));
      this.USDollar.total_basecost_per_Hour         = Number(((((this.USDollar.ctc_per_Annum/12)) / Number(this.t_hours?.value)) + this.O_cost_USD  ).toFixed(2));
      this.USDollar.markup_per_Month                = Number(((Number(this.markup?.value)/100 ) * (((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value))) ).toFixed(2));
      this.USDollar.markup_per_Hour                 = Number((((Number(this.markup?.value)/100 ) * (((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) ).toFixed(2)); 
      this.USDollar.recommended_billrate_per_Month  = Number(((((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value))) + ((Number(this.markup?.value)/100 ) * (((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value))))).toFixed(2));
      this.USDollar.recommended_billrate_per_Hour   = Number((((((this.USDollar.ctc_per_Annum/12)) / Number(this.t_hours?.value)) + this.O_cost_USD  ) + (((Number(this.markup?.value)/100 ) * (((this.USDollar.ctc_per_Annum/12))  + (this.O_cost_USD * Number(this.t_hours?.value)))) / (Number(this.t_hours?.value)) )).toFixed(2));  
      this.USDollar.operation_cost_per_Hour         = this.O_cost_USD
    }
    clear()
    {
      this.CalculateForm.reset();
      this.Emp_name="";
      this.ctc_perAnnum="";
      this.save_btn=false;
      this.clr_btn=false;
    }

    save()
    {
      // this.service.postData = JSON.stringify(this.CalculateForm.value)
      this.CalculateForm.controls['operation_cost_value'].setValue(this.Operation_Cost);
      this.CalculateForm.controls['currency_conversion_rate'].setValue(Number(this.USD_Logic));
      //Converting from string to numbers.
      //By default, input field datas are being string.
      this.service.postData = JSON.stringify(this.CalculateForm.getRawValue());
      this.service.postUserInputs()
      .subscribe(()=>
        {
        this.toastr.success("Data Stored Successfully");
        },
          ()=> //removing this will remove depriciated subscribe
          {
            this.toastr.error("Error Storing data !","Sorry");
          });
    }
    backtoAdmin()
    {
      this.route.navigate(['/admin']);
      // moved to admin.ts ngAfterViewInit
      // setTimeout(() => {
      //    this.service.isViewSubCalcutions = false;
      // }, 1000);
    }
    
    snackbar()
    { 
      var copied : any;
      domtoimage.toPng(this.screen.nativeElement)
      .then( (blobs) => 
      {
        copied = blobs;
        copyImageToClipboard(copied)
          .then(() => {
            this.toastr.info('Image Copied to Clipboard!');
          })
          .catch(() => {
            window.saveAs(blobs, "Rate Card - " + name + ' - ' + new Date().toJSON().slice(0,10).replace(/-/g,'/')+'.png');
            this.toastr.info('Image Saved!');
          })
      });
    }
    //File Export (File Saver)
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
      this.toastr.info('Saving Excel');
    } 
    tab_change_IKBR()
    {
      clearTimeout (this.Timeout) ;
      clearInterval(this.Interval);
      this.Timer = 3;
      this.IKBR_Btn = true;

      this.IKBR_Tab = true;
      this.DBR_Tab  = false;
      this.BC_Tab   = false;
      // Timer
      this.Interval = setInterval(() => {
          if(this.Timer > 0) {
            this.Timer--;
          } else {
            this.Timer = 3;
          }
      },1000)

      this.Timeout = setTimeout(() => {
        this.tab_change_DBR();
      },3000);
    }  
    tab_change_DBR()
    {
      this.IKBR_Btn = false;
      this.BC_Btn   = false;

      this.IKBR_Tab = false;
      this.DBR_Tab  = true;
      this.BC_Tab   = false;

      clearTimeout (this.Timeout) ;
      clearInterval(this.Interval);
      this.Timer = 3;
    }  
    tab_change_BC()
    {
      clearTimeout (this.Timeout) ;
      clearInterval(this.Interval);
      this.Timer = 3;
      this.BC_Btn   = true;

      this.IKBR_Tab = false;
      this.DBR_Tab  = false;
      this.BC_Tab   = true;
      // Timer
      this.Interval = setInterval(() => {
        if(this.Timer > 0) {
          this.Timer--;
        } else {
          this.Timer = 3;
        }
      },1000)
      this.Timeout = setTimeout(() => {
        this.tab_change_DBR();
      },3000);
    }
  }