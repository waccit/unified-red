import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  socket: any;

  constructor() {
    this.socket = io('http://localhost:1880', {path: '/ui/socket.io'});
  }


  listen(eventName: string) {
    return new Observable( (subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    });
  };

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  };
};
