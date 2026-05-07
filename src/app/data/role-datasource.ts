import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';

import { RoleService } from '../services';
import { GenericDataSource } from './generic-datasource';
import { RoleName } from './roleName.model';

export class RoleDataSource extends GenericDataSource<RoleName> {
    constructor(private roleService: RoleService, paginator: MatPaginator, sort: MatSort, private maxLevel: number) {
        super(paginator, sort);
    }

    dataSource() {
        return this.roleService.getAll().pipe(
            map((roles: RoleName[]) => roles.filter((r) => Number(r.level) <= this.maxLevel))
        );
    }

    searchColumns(item: RoleName) {
        return [item.level, item.name];
    }
}
