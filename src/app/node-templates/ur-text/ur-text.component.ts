import { Component, OnInit, Input } from '@angular/core';
import { WebSocketService } from '../../services';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent implements OnInit {
    @Input() data: any;
    nodeId: string;
    label: string;
    text: any;

    constructor(private webSocketService: WebSocketService) {}

    ngOnInit(): void {
        this.label = this.data.label;
        this.nodeId = this.data.id;
        // console.log('UrTextComponent nodeId: ', this.nodeId);

        // this.bgColor = localStorage.getItem('choose_skin_active') || 'cyan';
        // console.log('ur-text.comp bgColor: ', this.bgColor);
        this.webSocketService.emit('ui-replay-state', null);

        this.webSocketService.listen('update-value').subscribe((data: any) => {
            if (this.nodeId == data.id) {
                this.text = data.value;
            }
            console.log('ur-text comp webSocketService incoming data: ', data);
        });
    }

    getBgColor(): string {
        return localStorage.getItem('choose_skin_active') || 'orange';
    }
}
