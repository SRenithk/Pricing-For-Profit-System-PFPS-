import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild,  } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})

export class SidenavComponent implements OnInit {

  constructor(
    private toastr      : ToastrService,
    public  service     : ApiService,
    public  date        : DatePipe,
    private route       : Router,
    private cdr         : ChangeDetectorRef,
  ) 
  {
    this.RegisterForm.patchValue({createDateTime : this.updateCurrent_DateTime()})
  }
  //SideNav
  close_SideNav(event:any)
  {
    this.DataEmitter.emit(event);
  }
  @Output()
  DataEmitter:EventEmitter<any>=new EventEmitter();

  @Output()
  Call_GetCurrencyinParent: EventEmitter<any> = new EventEmitter();

  @Output()
  Call_Get_O_cost_INR_inParent: EventEmitter<any> = new EventEmitter();

  @Output()
  Call_Get_O_cost_USD_inParent: EventEmitter<any> = new EventEmitter();

  //To change the Login.checked from ts file
  //To change the tab from Reg to Login
  @ViewChild('Login') LoginChecked!: ElementRef;
  @ViewChild('Reg')   RegChecked  !: ElementRef;
  //Individual Inputs
  @ViewChild('USD_INR_input')    isUSD_INR              !: ElementRef;
  @ViewChild('O_cost_INR_input') isO_cost_INR_input     !: ElementRef;
  @ViewChild('O_cost_USD_input') isO_cost_USD_input     !: ElementRef;
  //Individual Edit icons
  @ViewChild('Currency_convert') isCurrecy_convert      !: ElementRef;
  @ViewChild('O_cost_INR')       isO_cost_INR           !: ElementRef;
  @ViewChild('O_cost_USD')       isO_cost_USD           !: ElementRef;


  //Common
  dark                    : boolean = false;
  LoginBtnText            : string = "Login";
  isForgotPass            : boolean = false;
  show_password_switch    : boolean = false;
  show_roleTypes          : boolean = true;
  
  //Authentication
  IsLoggedIn! : boolean;
  welcomeName!: any;
  
  //Encryption
  // Cipher_text: string = '74eb593087d54ecd96d1fd0f3d44a58728cdcd40c55227522223';
  encrypted: any = '';
  // decrypted!: string;
  // encrypted_storage! : any;

  //Currencies
  USD_INR_val!  :any;
  //Operation Cost
  O_cost_INR_val!  :any;
  O_cost_USD_val!  :any;

  //Role
  RegClear_btn:boolean=false;
    
  updateCurrent_DateTime()
  { return this.date.transform((new Date),this.service.dateFormat); }
  updateInitialvalues()
  {
    return {
      roleStatus      : 'N',
      createDateTime  : this.updateCurrent_DateTime()
    }
  }
  assignRole(data:any)
  {
    this.RegisterForm.controls['role'].setValue(data)
    this.RegClear_btn = true;
    this.show_roleTypes = false;
  }
  role_switch()
  {
    this.show_roleTypes = true;
  }
  Rolecheck()
  {
    if(this.service.RoleType.includes(this.RegisterForm.value.role))
    {
      return true;
    }
    return false;
  }
  dark_theme()    { this.dark = true ; }
  light_theme()   { this.dark = false; }
  ngOnInit(): void 
  {   
    this.getCurrency();
    this.getOperationCost(); //Executes all the statements
    this.welcomeName = localStorage.getItem("data1");
    this.service.decrypt_AES256();
    // Initial check whether logged in or not
    this.service.getAdmin()
    .subscribe(res=>
      {
        for(var i=0;i<Object.values(res).length;i++)
        {
          if(localStorage.getItem("data1")==Object.values(res)[i].username)
          {
            if(JSON.parse(this.service.decrypted)==Object.values(res)[i].password)
            {
              this.IsLoggedIn=true;
            }else{
              this.IsLoggedIn=false; 
            }
          }
        }
      })
  }
  LoginForm = new FormGroup({
    username_Login : new FormControl('',[
      Validators.required,
      // Validators.minLength(2),
      // Validators.pattern('^[a-zA-Z0-9 ]*$') 
      // AlphaNumberic with space
    ]),
    password_Login: new FormControl('',[
      Validators.required,
      Validators.minLength(8)
    ])
  })
  RegisterForm = new FormGroup({
    username : new FormControl('',[
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9 ]*$')
    ]),
    password: new FormControl('',[
      Validators.required,
      Validators.minLength(8)
    ]),
    c_password: new FormControl('',[
      Validators.required,
      Validators.minLength(8)
    ]),
    email: new FormControl('',[
      Validators.required,
      Validators.pattern('^[a-z0-9A-Z._%+-]+@[a-z0-9A-Z.-]+\\.[a-zA-Z]{2,4}$')
    ]),
    role: new FormControl('',[
      Validators.required,
    ]),
    roleStatus        : new FormControl('N'),
    createDateTime    : new FormControl(this.updateCurrent_DateTime()),
    approvedDateTime  : new FormControl('')
  })
  USD_INR_value = new FormControl('',[
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.maxLength(4)
  ])
  O_cost_INR_value = new FormControl('',[
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.maxLength(4)
  ])
  O_cost_USD_value = new FormControl('',[
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.maxLength(4)
  ])
  email_forgot = new FormControl('',[
    Validators.required,
    Validators.pattern('^[a-z0-9A-Z._%+-]+@[a-z0-9A-Z.-]+\\.[a-zA-Z]{2,4}$')
  ])
  get username_Login()      { return this.LoginForm.get('username_Login');   }
  get password_Login()      { return this.LoginForm.get('password_Login');   }

  get username()      { return this.RegisterForm.get('username');   }
  get password()      { return this.RegisterForm.get('password');   }
  get c_password()    { return this.RegisterForm.get('c_password'); }
  get email()         { return this.RegisterForm.get('email'); }
  get role()          { return this.RegisterForm.get('role');       }

  match_password()
  {
    if(this.RegisterForm.value.password == this.RegisterForm.value.c_password)
    {
      return true;
    }else{
      return false;
    }
  }
  show_password()
  {
    this.show_password_switch = !this.show_password_switch;
  }
  Loginsave()
  {
    this.service.getAdmin()
      .subscribe(res=>
        {
          for(var i=0;i<Object.values(res).length;i++)
          {
            if(this.LoginForm.value.username_Login==Object.values(res)[i].username || this.LoginForm.value.username_Login==Object.values(res)[i].email)
            {
              if(this.LoginForm.value.password_Login==Object.values(res)[i].password)
              {
                if(Object.values(res)[i].roleStatus !='N' && Object.values(res)[i].roleStatus !='D')
                {
                  this.encrypt_AES256();
                  localStorage.setItem("data1",Object.values(res)[i].username)
                  localStorage.setItem("data2",this.encrypted)
                  if(Object.values(res)[i].roleStatus =='A' || Object.values(res)[i].roleStatus =='H')
                  {
                    localStorage.setItem("data3",Object.values(res)[i].role)
                  } 
                  this.IsLoggedIn = true;
                  this.toastr.success("Welcome "+Object.values(res)[i].username)
                  this.welcomeName = Object.values(res)[i].username;
                  this.LoginForm.reset();
                  return;
                }
                if(Object.values(res)[i].roleStatus =='N')
                {
                  this.toastr.info("Your Request is not yet Approved");
                  return
                }
                if(Object.values(res)[i].roleStatus == 'D')
                {
                  this.toastr.error("Your Access/Request was Removed ","Sorry :- (");
                  this.LoginBtnText = "Req"
                  setTimeout(() => {
                    this.LoginBtnText = "Login"
                  }, 5000);
                  return
                }
              }
            }
          }
          this.toastr.error("Invalid Username/Password!")
        })
  }
  RequestAgain()
  {
    this.LoginBtnText="Login";
    this.toastr.clear();
    // this.service.PendingApprovalLength(); using getAdmin() below instead of two api calls
    // Get the exact details of who logging in \\\
    this.service.getAdmin().subscribe(res=>{
      var filtered_data = Object.values(res).find(data => 
        (data.username == this.LoginForm.value.username_Login || data.email == this.LoginForm.value.username_Login) &&
        (data.password == this.LoginForm.value.password_Login))
      // Change the roleStatus from D to N again \\\
      this.service.putId = filtered_data.id;
      filtered_data.roleStatus = 'N';
      filtered_data.createDateTime = this.updateCurrent_DateTime();
      this.service.putData = filtered_data;
      this.service.putAdmin().subscribe();
      //To reset the badge
      this.service.pendingApproval_length = (Object.values(res).filter(res=>res.roleStatus=='N').length);
      //Assing Name and Role for email
      this.service.email_data.params.EMAIL   = filtered_data.username; //name
      this.service.email_data.params.SMS         = filtered_data.role;     //role
      this.service.email_data.templateId = 5; 
      this.service.sendEmail("User Access request");
      this.toastr.info("Your Request is waiting for Approval");
    })
  }
  Regsave()
  {
    this.service.getAdmin()
      .subscribe(res=>{
        for(var i=0;i<Object.values(res).length;i++)
        {
          if(Object.values(res)[i].username==this.RegisterForm.value.username)
          {
            this.toastr.error("Username already exists");
            return;
          }
          if(Object.values(res)[i].email==this.RegisterForm.value.email)
          {
            this.toastr.error("E-mail already registered");
            return;
          }
        }
        this.service.postData = JSON.stringify(this.RegisterForm.value);
        this.service.postAdmin()
          .subscribe(()=>
          {
            this.service.PendingApprovalLength(); //to reset the badge
            this.LoginChecked.nativeElement.checked = true; //To switch from Register to Login screen
            //It's Like Login.checked in HTML (where #Login)
            if(this.RegisterForm.value.username != null && 
              this.RegisterForm.value.role !=null      &&
              this.RegisterForm.value.email!=null )
              {
                //Add a contact for email
                this.service.contact_email  = this.RegisterForm.value.email;
                this.service.contact_FN     = this.RegisterForm.value.username;
                this.service.add_email_contact();
                //Assing Name and Role for email
                this.service.email_data.params.EMAIL    = this.RegisterForm.value.username; //name
                this.service.email_data.params.SMS      = this.RegisterForm.value.role;     //role
                this.service.sendEmail("User Access request");
                this.RegisterForm.reset();
                this.toastr.success("Your Request is waiting for Approval");
              }
          });
      })
  }
  Logout(row : any, dialogType:string)
  {
    this.service.openDialog_service(row, dialogType).subscribe(res=>{
      if(res == 'loggedout')
      {
        this.IsLoggedIn=false;
        localStorage.clear();
        this.welcomeName = "";
        this.route.navigate(['/']);
      }
    });

  }
  Loginclear()
  {
    this.LoginForm.reset();
    this.LoginForm.controls['username_Login'].setValue("")
    this.LoginForm.controls['password_Login'].setValue("")
    // this.save_btn=false;
  }
  Regclear()
  {
    this.RegisterForm.reset();
    this.RegClear_btn = false;
  }
  EditClicked()
  {
    if(this.isCurrecy_convert.nativeElement.checked)
    {
      setTimeout(() => { this.isUSD_INR.nativeElement.focus() }, 50);
      this.USD_INR_value.reset();
    }
    if(this.isO_cost_INR.nativeElement.checked)
    {
      setTimeout(() => { this.isO_cost_INR_input.nativeElement.focus() }, 50);
      this.O_cost_INR_value.reset();
    }
    if(this.isO_cost_USD.nativeElement.checked)
    {
      setTimeout(() => { this.isO_cost_USD_input.nativeElement.focus() }, 50);
      this.O_cost_USD_value.reset();
    }
  }
  encrypt_AES256() 
  {
    let _key = CryptoJS.enc.Utf8.parse(this.service.Cipher_text);
    let _iv = CryptoJS.enc.Utf8.parse(this.service.Cipher_text);
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(this.LoginForm.value.password_Login), _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    this.encrypted = encrypted.toString();
  }
    //decryption in api.service.ts
  auto()
  {
    if(this.LoginChecked || this.RegChecked)
    {
      this.isForgotPass = false;
      this.LoginForm.reset();
      this.RegisterForm.reset(this.updateInitialvalues()); 
    }
  }
  backtoLogin()
  { 
    this.LoginChecked.nativeElement = true; 
    this.isForgotPass = false;
    this.email_forgot.reset();
  }
  getCurrency()
  {
    this.service.getCurrencyValue().subscribe(res=>{
      this.USD_INR_val = Object.values(res).find(x=>x.ConversionType == "USD_INR");
    })
  }
  getOperationCost()
  {
    this.service.getOperationCostValue().subscribe(res=>{
      this.O_cost_INR_val = Object.values(res).find(x=>x.CurrencyType == "INR")
      this.O_cost_USD_val = Object.values(res).find(x=>x.CurrencyType == "USD")
    })
  }
  ValueAccept(Edit_data:any)
  {
    switch (Edit_data) 
    { 
      case "edit_1":
        //Edit data 
        this.USD_INR_val.ConversionValue = this.USD_INR_value.value; 
        //(PUT)
        this.service.putId    = this.USD_INR_val.id;
        this.service.putData  = this.USD_INR_val;
        this.service.putCurrencyValue().subscribe(()=>{
          // To pass the event after getting the latest currency value
          this.Call_GetCurrencyinParent.emit(this.USD_INR_val.ConversionValue); 
        })
        this.isCurrecy_convert.nativeElement.checked = false;
      break;
      case "edit_2":
        //Edit data
        this.O_cost_INR_val.OperationCost_Value = this.O_cost_INR_value.value;
        //(PUT)
        this.service.putId = this.O_cost_INR_val.id;
        this.service.putData = this.O_cost_INR_val;
        this.service.putOperationCostValue().subscribe(()=>{
          //To pass the event after getting the latest Operation cost value
          this.Call_Get_O_cost_INR_inParent.emit(this.O_cost_INR_val.OperationCost_Value);
        })
        this.isO_cost_INR.nativeElement.checked = false;
      break;
      case "edit_3":
        //Edit data
        this.O_cost_USD_val.OperationCost_Value = this.O_cost_USD_value.value;
        //(PUT)
        this.service.putId = this.O_cost_USD_val.id;
        this.service.putData = this.O_cost_USD_val;
        this.service.putOperationCostValue().subscribe(()=>{
          //To pass the event after getting the latest Operation cost value
          this.Call_Get_O_cost_USD_inParent.emit(this.O_cost_USD_val.OperationCost_Value);
        })
        this.isO_cost_USD.nativeElement.checked = false;
      break;
      //ForgotPass
      case "email_forgot":
        this.service.getAdmin().subscribe(res=>
        {
          var data = Object.values(res).find(x=>x.email == this.email_forgot.value);
          if(!data)
          {
            this.toastr.error("This E-mail is not registered");
            return;
          }else
          {
            this.toastr.success("Password is sent to your E-mail");
            // send Email
          }
        })
      break;   
    }
  }
  ValueReject(Reject_data:any)
  {
    switch(Reject_data)
    {
      case "edit_1":
        this.USD_INR_value.reset();
        this.isCurrecy_convert.nativeElement.checked=false;
      break;
      case "edit_2":
        this.O_cost_INR_value.reset();
        this.isO_cost_INR.nativeElement.checked = false;
      break;
      case "edit_3":
        this.O_cost_USD_value.reset();
        this.isO_cost_USD.nativeElement.checked = false;
      break;
      case "email_forgot":
        this.email_forgot.reset();
        break;
    }
  }
  EnableFP()
  {
    this.isForgotPass = true;
  }
}