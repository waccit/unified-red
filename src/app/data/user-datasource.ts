import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { formatDate } from '@angular/common';

import { UserService, RoleService } from '../services';
import { GenericDataSource } from './generic-datasource';
import { User } from './user.model';
import { first, map } from 'rxjs/operators';

export class UserDataSource extends GenericDataSource<User> {
    private customRoleNames = {};

    constructor(private userService: UserService, private roleService: RoleService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
        // build custom role name lookup array
        this.roleService.getAll().subscribe(roles => {
            if (roles) {
                for (const r of roles) {
                    this.customRoleNames[r.level] = r.name;
                }
            }
        });
    }

    dataSource() {
        return this.userService.getAll().pipe(map((users) => {
            return users.map(user => {
                user.role = this.customRoleNames[user.role];
                return user;
            })
        }));
    }

    searchColumns(item: User) {
        return [
            item.username,
            item.firstName,
            item.lastName,
            item.email,
            item.role,
            item.enabled ? 'enabled' : 'disabled',
            item.expirationDate ? formatDate(item.expirationDate, 'MM/dd/yyyy', 'en') : '',
        ];
    }
}
