import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Product } from './product';
import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataService {
// tslint:disable-next-line:no-inferrable-types
public first: string = ' ';
// tslint:disable-next-line:no-inferrable-types
public prev: string = ' ';
// tslint:disable-next-line:no-inferrable-types
public next: string = ' ';
// tslint:disable-next-line:no-inferrable-types
public last: string = ' ';

 private REST_API_SERVER = 'http://localhost:3000';
  constructor(private httpClient: HttpClient) { }

  /* another way : handle errors globally using HttpClientinterceptors. */
handleError(error: HttpErrorResponse) {
  let errorMessage = 'unkown error!';
  if (error.error instanceof ErrorEvent) {
  // Client-side errors
  errorMessage = `Error: ${error.error.message}`;
   /* same thing error.error.message */
  } else {
    /* Server-side errors */
    errorMessage = `Error: ${error.status}\nMessager: ${error.message}`;
}
  window.alert(errorMessage);
  return throwError(errorMessage);
}
 /* another way : handle errors globally using HttpClientinterceptors. */

/* retry() : automatically re-subscribe to an RxJS Observable a specified number of times.
  the effect of resending the HTTP request to the server  */
  public sendGetRequest() {
 /* return first page of data of 20 products */
return this.httpClient.get<Product[]>(this.REST_API_SERVER, { params: new HttpParams({fromString: '_page=1&_limit=20'}), observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res =>{
  console.log(res.headers.get('Link'));
  this.parseLinkHeader(res.headers.get('Link'));
}));
  }

  public sendGetRequestToUrl(url: string){
    return this.httpClient.get<Product[]>(url, {observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res =>{
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
      }


  parseLinkHeader(header) {
    if (header.length == 0) {
      return ;
    }
    let parts = header.split(',');
    var links = {};
    parts.forEach( p => {
      let section = p.split(';');
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      var name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });
    this.first  = links["first"];
    this.last   = links["last"];
    this.prev   = links["prev"];
    this.next   = links["next"]; 
  }

}
