import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { MatDialogComponent } from './components/mat-dialog/mat-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(  
    public  http        : HttpClient,
    private route       : Router,
    private toastr      : ToastrService,
    public  date        : DatePipe,
    public dialog       : MatDialog,
    ) { }

  decrypted!              : string;
  Cipher_text             : string = '74eb593087d54ecd96d1fd0f3d44a58728cdcd40c55227522223';
  encrypted_storage!      : any;
  options                 : any = {headers: {'Content-Type': 'application/json'}};
  pendingApproval_length  !:number;
  dateFormat              : string = 'MMM-dd-yyyy h:mm a z'

  putId                   : number = 0;  
  putData                 : any;  
  postData                : any;
  deleteId                : any;
  postINR_val             : any;
  postUSD_val             : any;

  //View Submitted Calculations
  isViewSubCalcutions       : boolean = false;
  ViewSubCalculations_data  : any;

  //Email Fields
  email         !: string;
  name          !: string;
  contact_email !: string;
  contact_FN    !: string;
  email_url     = 'https://api.sendinblue.com/v3/smtp/email';
  API_KEY       = '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';
  email_headers : any = { headers : {
    'accept': 'application/json',
    'api-key': this.API_KEY
  }};

  email_data = {
    to: [
      {email : '', name : ''}
      ],
    sender: 
      { email: 'pfps.no-reply@outlook.com',
        name : 'PFPS' 
      },
    "templateId": 0,
    "params": 
    {
      "FIRSTNAME": "",
      "LASTNAME": "",
      "SMS": "",
      "EMAIL": ""
    },
  }

  // HTTP Methods \\\
  // 
  checkAPIConnection() { return this.http.get(`${environment.base_url}/checkConnection`)}

  getUserInputs()     { return this.http.get(`${environment.base_url}/UserInputs`)}
  postUserInputs()    { return this.http.post(`${environment.base_url}/UserInputs`,this.postData,this.options)}  
  deleteUserInputs()  { return this.http.delete(`${environment.base_url}/UserInputs/`+this.deleteId)}

  // getEmployeeId()     { return this.http.get(`${environment.base_url}/getEmployeeId`)}

  getEmployees()      { return this.http.get(`${environment.base_url}/employees`) }
  postEmployees()     { return this.http.post(`${environment.base_url}/employees`,this.postData,this.options)}

  // postINR() { return this.http.post(`${environment.base_url}/rupee`   ,this.postINR_val,this.options)}
  // postUSD() { return this.http.post(`${environment.base_url}/usdollar`,this.postUSD_val,this.options)}

  getAdmin() { return this.http.get (`${environment.base_url}/admin`) }
  putAdmin() { return this.http.put (`${environment.base_url}/admin/`+this.putId,this.putData)}
  postAdmin(){ return this.http.post(`${environment.base_url}/admin`,this.postData,this.options)}

  getCurrencyValue() { return this.http.get(`${environment.base_url}/CurrencyValues`)}
  putCurrencyValue() { return this.http.put(`${environment.base_url}/CurrencyValues/`+this.putId,this.putData)}

  getOperationCostValue() { return this.http.get(`${environment.base_url}/OperationCost`)}
  putOperationCostValue() { return this.http.put(`${environment.base_url}/OperationCost/`+this.putId,this.putData)}
  // 


  // getUserInputs()     { return this.http.get(`${environment.base_url}/getUserInputs`)}
  // postUserInputs()    { return this.http.post(`${environment.base_url}/postUserInputs`,this.postData,this.options)}  
  // deleteUserInputs()  { return this.http.delete(`${environment.base_url}/deleteUserInputs/`+this.deleteId)}

  // getEmployeeId()     { return this.http.get(`${environment.base_url}/getEmployeeId`)}

  // getEmployees()      { return this.http.get(`${environment.base_url}/getemployees`) }
  // postEmployees()     { return this.http.post(`${environment.base_url}/postemployees`,this.postData,this.options)}

  // postINR() { return this.http.post(`${environment.base_url}/rupee`   ,this.postINR_val,this.options)}
  // postUSD() { return this.http.post(`${environment.base_url}/usdollar`,this.postUSD_val,this.options)}

  // getAdmin() { return this.http.get (`${environment.base_url}/getadmin`) }
  // putAdmin() { return this.http.put (`${environment.base_url}/putadmin/`+this.putId,this.putData)}
  // postAdmin(){ return this.http.post(`${environment.base_url}/postadmin`,this.postData,this.options)}

  // getCurrencyValue() { return this.http.get(`${environment.base_url}/getCurrencyValues`)}
  // putCurrencyValue() { return this.http.put(`${environment.base_url}/putCurrencyValues/`+this.putId,this.putData)}

  // getOperationCostValue() { return this.http.get(`${environment.base_url}/getOperationCost`)}
  // putOperationCostValue() { return this.http.put(`${environment.base_url}/putOperationCost/`+this.putId,this.putData)}
  // HTTP Methods ///
  
  data! : any;
  //Angular Material - AutoComplete
  private _filter(employeeData: any[], value: string):string[]
  { 
    const filterValue = value.toLowerCase();
    return employeeData.filter((option: any) => 
    {
      const regex = new RegExp(`.*${filterValue}.*`, 'i');
      return regex.test(option.employee_name);
    })
    .map((option: any) => option.employee_name);
  }
  getEmployeeData(value: string): Observable<string[]> {
    return this.http.get<any[]>(`http://localhost:3000/employees?q=${value}`)
    // return this.http.get<any[]>(`${environment.base_url}/getemployees?q=${value}`)
      .pipe(
        // tap(employeeData => console.log('API response:', employeeData)),
        map(employeeData => this._filter(employeeData, value))
      );
  }

  //Automated Mail using sendinblue
  sendEmail(type : any) {
    this.getAdmin().subscribe(res=>
      {
        switch (type)
        {
          case "User Access request":
            this.email_data.templateId = 5;                               //Id for this Template
            this.email_data.params.FIRSTNAME = "Admin";                   //Dear Admin
            var Admin = Object.values(res).filter(x=>x.roleStatus == 'A') //Email to admins
            for(var i=0; i<Admin.length;i++)
            { 
              var data = {
                email : Admin[i].email,
                name  : Admin[i].username
              }
              this.email_data.to[i] = data;
            }
          break;
          case "Approve Request":
            var adminName : any;
            this.email_data.templateId = 1;    //Id for template
            adminName = localStorage.getItem("data1");  // which Admin approved the request
            this.email_data.params.EMAIL = adminName;   //passed via variable to remove string | null error
            this.email_data.params.SMS = "approved"
          break;
        }
        // if(type == "User Access request")
        // {}
        this.postmail();
      })
  }
  postmail()
  {
    this.http.post(this.email_url, this.email_data, this.email_headers ).subscribe(response => {
      console.log(response); 
      });
  }
  add_email_contact()
  {
    const API_URL = 'https://api.sendinblue.com/v3/contacts';
    const contact = { email: this.contact_email, attributes: { FIRSTNAME: this.contact_FN } };
    // , LASTNAME: this.contact_LN 
    this.http.post(API_URL, contact, { headers: { 'api-key': this.API_KEY }})
    .subscribe(data => 
    {
      console.log(data);
    });
  }

  // Encryption(SideNav.component.ts) & Decryption
  decrypt_AES256() 
  {
    if(localStorage.getItem("data2")!=null) //Encypted pass
    //when ngOnInit while logged out ,it shows some error in console cannot read null
    {
      this.encrypted_storage = localStorage.getItem("data2");
      let _key = CryptoJS.enc.Utf8.parse(this.Cipher_text);
      let _iv = CryptoJS.enc.Utf8.parse(this.Cipher_text);
  
        this.decrypted = CryptoJS.AES.decrypt(this.encrypted_storage, _key, {
          keySize: 16,
          iv: _iv,
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8);
    }
  }
  //custom Observable which we can subscirbe and get a dialogRef.afterClosed() value
  openDialog_service(row : any, dialogType:string) : Observable<string> 
  {
    const enterAnimationDuration = '300ms';
    const exitAnimationDuration  = '300ms'
    const dialogRef = this.dialog.open(MatDialogComponent, {
      width: '40vmin',height: '25vmin', enterAnimationDuration, exitAnimationDuration, data: { dialogType: dialogType , row : row },
    });
    return dialogRef.afterClosed();
  }
  //Authorization 
  AuthAdmin()
  {
    this.decrypt_AES256();
    return this.getAdmin().pipe(
      map((res)=>
      {
        if(Object.values(res).find(x=>
          x.username == localStorage.getItem("data1") && 
          x.password == JSON.parse(this.decrypted)    &&
          x.role     == localStorage.getItem("data3")
          ))
        {
          return true;
        }
        else
        {
          this.route.navigate(['/'])
          this.toastr.error('You\'re not Authorized')
          return false;
        }
      })
    )
  }

  // Approval  
  isApproved(data:any)
  {
    //Assign values for Email
    this.email_data.to[0].email = data.email;
    this.email_data.to[0].name  = data.username;
    this.email_data.params.FIRSTNAME = data.username;
    data.approvedDateTime = this.date.transform((new Date),this.dateFormat);
    if(data.role == "Admin")
    {
      data.roleStatus = "A";
      this.email_data.params.LASTNAME = "Admin";
    }
    else if(data.role == "Higher Official")
    {
      data.roleStatus = "H"
      this.email_data.params.LASTNAME = "Higher Official";
    }
    this.putId = data.id;
    this.putData = data;
    this.sendEmail("Approve Request");
    // this.putAdmin().subscribe();    moved to the admin-page component
  }

  isDenied(data:any)
  {
    this.putId = data.id;
    data.roleStatus = "D"
    this.putData = data;
  }

  isPromoted(data:any)
  {
    this.putId = data.id;
    data.roleStatus = "A";
    data.role = "Admin"
    this.putData = data;
  }

  isDemoted(data:any)
  {
    this.putId = data.id;
    data.roleStatus = "H";
    data.role = "Higher Official"
    this.putData = data;
  }
  PendingApprovalLength()
  {
    this.getAdmin()
    .subscribe(res=>{
      this.pendingApproval_length = (Object.values(res).filter(res=>res.roleStatus=='N').length)
    })
  }

  RoleType : any=[
  'Higher Official',
  'Admin'
  ];
}