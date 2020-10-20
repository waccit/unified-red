import { GroupWidgets } from '../group/group-widget';

export class PageGroups {
    constructor(public header: string, public access: string, public cols: any, public widgets: GroupWidgets[]) {}
}
