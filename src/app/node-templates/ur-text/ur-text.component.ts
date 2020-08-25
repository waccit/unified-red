import { Component, Input, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { WebSocketService } from '../../services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent implements AfterViewInit, OnDestroy {
    @Input() data: any;
    nodeId: string;
    label: string;
    text: any;
    private _wsSubscription: Subscription;

    constructor(private webSocketService: WebSocketService) {}

    ngAfterViewInit(): void {
        this.label = this.data.label;
        this.nodeId = this.data.id;

        this.webSocketService.emit('ui-replay-state', {});

        this._wsSubscription = this.webSocketService.listen('update-value').subscribe((data: any) => {
            if (this.nodeId == data.id) {
                this.text = data.value;
                // console.log('ur-text comp webSocketService incoming data: ', data);
            }
        });
    }

    // ngOnInit(): void {
    //     this.label = this.data.label;
    //     this.nodeId = this.data.id;

    //     this.webSocketService.emit('ui-replay-state', {});

    //     this._wsSubscription = this.webSocketService.listen('update-value').subscribe((data: any) => {
    //         if (this.nodeId == data.id) {
    //             this.text = data.value;
    //             // console.log('ur-text comp webSocketService incoming data: ', data);
    //         }
    //     });
    // }

    ngOnDestroy(): void {
        if (this._wsSubscription !== undefined) {
            this._wsSubscription.unsubscribe();
        }
        // console.log('ur-text onDestroy called');
    }

    getBgColor(): string {
        return localStorage.getItem('choose_skin_active') || 'orange';
    }
}
