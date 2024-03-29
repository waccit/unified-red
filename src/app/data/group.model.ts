import { Tab } from './tab.model';

export class Group {
    constructor(
        public header: string,
        public cols: any,
        public tabs: Tab[],
        public displayHeader: boolean,
        public disabled: boolean,
        public access: string,
        public accessBehavior: string
    ) {}
}
