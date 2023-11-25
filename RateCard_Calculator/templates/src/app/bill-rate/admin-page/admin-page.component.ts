import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit,AfterViewInit {

  constructor(
    public http     : HttpClient,
    public service  : ApiService,
    private cdr     : ChangeDetectorRef,
    private route   : Router
  ) { }

  //Common
  dark                          : boolean = false;
  You                           : any = "";
  badgeHidden                   : boolean = false;
  expand_accordion              : boolean = false;  
  SubmittedCalculations_length! : number 
  //may cause NG100 ExpressionChangedAfterItHasBeenCheckedError 
  //(To resolve uncomment the cdr.detectchanges() in ngAfterViewInit())
  //Angular Table
  pendingApproval_data        !:MatTableDataSource<any>;
  ApprovedUsers_data          !:MatTableDataSource<any>;
  SubmittedCalculations_data  !:MatTableDataSource<any>;

  PendingApproval_Columns         : string[] = ['username', 'role', 'createDateTime','approve','deny'];
  ApprovedUsers_Columns           : string[] = ['username', 'role', 'approvedDateTime','changeAccess','removeAccess'];
  SubmittedCalculations_Columns   : string[] = ['emp_name', 'ctc', 'markup','t_hours','date_time','currency_type','view','delete']; //'date_time','currency_type'
  @ViewChild('MatPage1')      pendingApproval_paginator         !: MatPaginator;
  @ViewChild('MatSort1')      pendingApproval_sort              !: MatSort;
  @ViewChild('MatPage2')      ApprovedUsers_paginator           !: MatPaginator;
  @ViewChild('MatSort2')      ApprovedUsers_sort                !: MatSort;
  @ViewChild('MatPage3')      SubmittedCalculations_paginator   !: MatPaginator;
  @ViewChild('MatSort3')      SubmittedCalculations_sort        !: MatSort;

  ngOnInit() {
    this.You = localStorage.getItem("data1");
    this.service.PendingApprovalLength();
  }
  ngAfterViewInit() {
    this.AssignTableData("Overall");
    this.service.isViewSubCalcutions = false;
  }
  // PendingApprovalLength() {} //moved to service for sharing accross components
  isAdminPage()
  {
    if(localStorage.getItem("data3")!="Admin")
    {
      return false;
    }
    return true;
  }
  AssignTableData(data:string)
  {
    this.service.getAdmin()
    .subscribe(res=>
    {
      this.expand_accordion = true; //due to delay in loading data 
      //(may cause NG100 error) //uncomment the cdr.detectchanges to resolve
      if(data == "PA" || "PA_AU" || "Overall")
      {
        // Pending Approval
        this.pendingApproval_data                 = new MatTableDataSource(Object.values(res).filter(res=>res.roleStatus=='N'));
        this.pendingApproval_data.paginator       = this.pendingApproval_paginator;
        this.pendingApproval_data.sort            = this.pendingApproval_sort;
      }
      if(data == "AU" || "PA_AU" || "Overall")
      {
        //Approved Users
        this.ApprovedUsers_data                   = new MatTableDataSource(Object.values(res).filter(res=>res.roleStatus=='H'|| res.roleStatus=='A'));
        this.ApprovedUsers_data.paginator         = this.ApprovedUsers_paginator;
        this.ApprovedUsers_data.sort              = this.ApprovedUsers_sort;
      }
      this.cdr.detectChanges();
    })
    if(data == "SC" || "Overall")
    {
      this.service.getUserInputs()
      .subscribe(res=>
      {
        //Submitted Calculations
        this.SubmittedCalculations_data           = new MatTableDataSource(Object.values(res));
        this.SubmittedCalculations_data.paginator = this.SubmittedCalculations_paginator;
        this.SubmittedCalculations_data.sort      = this.SubmittedCalculations_sort;
        this.cdr.detectChanges();
      })
    }
  }
  openDialog(row : any, dialogType:string) {
    this.service.openDialog_service(row, dialogType).subscribe(res=>{
      switch(res)
      {
        case "denied": // same for remove 
          this.Deny(row)
        break;
        case "deleted":
          this.Delete(row)
        break;
      }
    });
  }
  Approve(data:any)
  {
    this.service.isApproved(data);
    this.service.putAdmin().subscribe(()=>{
      this.AssignTableData("PA");
      this.service.PendingApprovalLength();
    });
  }
  Deny(data:any)
  {
    this.service.isDenied(data);
    this.service.putAdmin().subscribe(()=>{
      this.AssignTableData("PA_AU");
      this.service.PendingApprovalLength();
    });
  }
  Promote(data:any)
  {
    this.service.isPromoted(data);
    this.service.putAdmin().subscribe(()=>{
      this.AssignTableData("AU");
    });
  }
  Demote(data:any)
  {
    this.service.isDemoted(data);
    this.service.putAdmin().subscribe(()=>{
      this.AssignTableData("AU");
    });
  }
  View(data:any)
  {
    console.log(data)
    this.service.isViewSubCalcutions = true;
    this.service.ViewSubCalculations_data = data;
    this.route.navigate(['/']);
  }
  Delete(data:any)
  {
    this.service.deleteId=data.id;
    this.service.deleteUserInputs().subscribe(()=>
      {
        this.AssignTableData("SC");
      });
  }

  toggleBagdeHidden()
  {
    this.badgeHidden=!this.badgeHidden;
  }
  PendingApproval_Filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pendingApproval_data.filter = filterValue.trim().toLowerCase();
    if (this.pendingApproval_data.paginator) 
    {
      this.pendingApproval_data.paginator.firstPage();
    }
  }
  ApprovedUsers_Filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ApprovedUsers_data.filter = filterValue.trim().toLowerCase();
    if (this.ApprovedUsers_data.paginator) 
    {
      this.ApprovedUsers_data.paginator.firstPage();
    }
  }
  SubmittedCalculations_Filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.SubmittedCalculations_data.filter = filterValue.trim().toLowerCase();
    if (this.SubmittedCalculations_data.paginator) 
    {
      this.SubmittedCalculations_data.paginator.firstPage();
    }
    setTimeout(() => {
      this.SubmittedCalculations_length = this.SubmittedCalculations_data.paginator?.length ?? 0;
    },1);
  }
}
 
