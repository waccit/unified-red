import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { RoleService } from '../services';
import { GenericDataSource } from './generic-datasource';
import { RoleName } from './roleName.model';

export class RoleDataSource extends GenericDataSource<RoleName> {
    constructor(private roleService: RoleService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
    }

    dataSource() {
        return this.roleService.getAll();
    }

    searchColumns(item: RoleName) {
        return [item.level, item.name];
    }
}
