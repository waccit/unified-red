import { Tab } from './tab.model';

export class Group {
    constructor(
        public header: string,
        public access: string,
        public cols: any,
        public tabs: Tab[],
        public displayHeader: boolean
    ) {}
}
