import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from './bill-rate/shared/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'RateCard_Calculator';

  constructor(
    private service : ApiService
    )
  { }
  connection : boolean = false;

  ngOnInit(): void {
    this.connection = true;

    this.returnConnection();
    setInterval(() => {
      this.returnConnection();
    }, 5000);
  }

  //check API connection
  checkConnection(): Observable<boolean> {
    return this.service.checkAPIConnection().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
  returnConnection()
  {
    this.checkConnection().subscribe((res)=>{
      if(res)
      {
        this.connection = true;
      }
      else{
        this.connection = false;
      }
    })
  }
}
//   checkConnection()
//   {
//     this.http.get(`${environment.base_url}/checkConnection`)
//     .subscribe(()=>{
//     this.connection = true;
//     },
//     ()=>{
//     this.connection = false;
//     });
//   }
// }

