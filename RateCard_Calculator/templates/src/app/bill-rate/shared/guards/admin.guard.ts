import { Injectable } from '@angular/core';
import { CanActivate} from '@angular/router';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private service   : ApiService
    ){}
  canActivate()
  {
    return this.service.AuthAdmin();
  }
}
