import { Component, OnInit, Input } from '@angular/core';
import { WebSocketService } from '../../services';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent implements OnInit {
    // @Input() text: string = 'default';
    @Input() data: any;
    nodeId: string;
    label: string = 'default';
    text: any;

    constructor(private webSocketService: WebSocketService) {}

    ngOnInit(): void {
        this.label = this.data.label;
        this.nodeId = this.data.id;
        console.log('UrTextComponent nodeId: ', this.nodeId);
        // TODO: Add WebSocketService Listener
        this.webSocketService.listen('update-value').subscribe((data: any) => {
            if (this.nodeId == data.id) {
                this.text = data.value;
            }
            console.log('ur-text comp webSocketService incoming data: ', data);
        });
    }
}
