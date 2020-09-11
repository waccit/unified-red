import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    updateValueEventName = 'update-value';
    socket: any;

    constructor() {
        this.socket = io(window.location.origin, { path: '/ui/socket.io' });
    }

    // connect(onUiLoaded: Function, replaydone: Function) {
    //     this.socket = io('http://localhost:1880', { path: '/ui/socket.io' });

    //     // this.listen('ui-controls').subscribe((data: any) => {
    //     //     onUiLoaded(data, () => {
    //     //         this.socket.emit('ui-replay-state');
    //     //     });
    //     // });

    //     // this.listen('connect').subscribe(())
    //     this.socket.on('ui-controls', (data) => {
    //         onUiLoaded(data, () => {
    //             this.socket.emit('ui-replay-state');
    //         });
    //     });

    //     this.socket.on('connection');
    //     // this.
    // }

    listen(eventName: string) {
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            });
        });
    }

    listenOnce(eventName: string) {
        return new Observable((subscriber) => {
            this.socket.once(eventName, (data) => {
                subscriber.next(data);
            });
        });
    }

    emit(event: any, msg?: any) {
        if (typeof msg === 'undefined') {
            msg = event;
            event = this.updateValueEventName;
        }

        msg.socketId = this.socket.id;
        this.socket.emit(event, msg);
    }

    // disconnect(eventName: string, handler: Function) {
    //     this.socket.removeListener(eventName, handler);
    //     this.socket.off(eventName, handler)
    // }

    join(room: string) {
        this.socket.emit("join", room);
    }

    leave(room: string) {
        this.socket.emit("leave", room);
    }
}
