import { Widget } from './widget.model';

export class Tab {
    constructor(
        public header: string,
        public disabled: boolean,
        public hidden: boolean,
        public widgets: Widget[],
        public access: string,
        public accessBehavior: string
    ) {}
}
