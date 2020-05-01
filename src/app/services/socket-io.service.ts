import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private updateValueEventName: string = 'update-value';
  // private that = this;
  private id: any;
  
  // public emit: any;
  // public on: any;

  constructor(private socket: Socket) { 
    // console.log('SocketIoService constructor: ', socket);
  }

  public connect (onuiloaded, replaydone) {
    this.socket.ioSocket.on('ui-controls', data => {
      onuiloaded(data, () => {
        this.socket.ioSocket.emit('ui-replay-state');
      })
    });

    this.socket.ioSocket.on('ui-replay-done', () => {
      replaydone();
    });

    this.socket.ioSocket.on('connect', () => {
      this.id = this.socket.ioSocket.id;
    })
  }

  public emit = (event, msg) => {
    if (typeof msg === 'undefined') {
      msg = event;
      event = this.updateValueEventName;
    }

    this.socket.ioSocket.emit(event, msg);
  }

  public on = (event, handler) => {
    if (typeof handler === 'undefined') {
      handler = event;
      event = this.updateValueEventName;
    }

    let socketHandler = data => {
      handler(data);
    }

    this.socket.ioSocket.on(event, socketHandler);

    return function () { this.socket.ioSocket.removeListener(event, socketHandler); };
  }

  // public getUpdate = () => {
  //   return Observable.create( observer => {
  //     this.socket.on('update-value', data => {
  //       observer.next(data);
  //     });
  //   } );
  // }
}
