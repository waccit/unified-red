import { groupWidgets } from '../group/group-widget';

export class pageGroups {
    constructor(public header: string, public access: string, public cols: any, public widgets: groupWidgets[]) {}
}
