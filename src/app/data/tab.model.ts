import { Widget } from './widget.model';

export class Tab {
    constructor(public header: string, public widgets: Widget[]) {}
}
