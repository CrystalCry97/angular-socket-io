import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;
  readonly uri: string = 'ws://10.212.241.184:5000';

  constructor() {
    this.socket = io.connect(this.uri);
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName,  (data) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

}
