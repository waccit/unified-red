import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { formatDate } from '@angular/common';
import { combineLatest } from 'rxjs';

import { UserService, RoleService } from '../services';
import { GenericDataSource } from './generic-datasource';
import { User } from './user.model';
import { map, take } from 'rxjs/operators';

export class UserDataSource extends GenericDataSource<User> {
    constructor(private userService: UserService, private roleService: RoleService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
    }

    dataSource() {
        return combineLatest([
            this.userService.getAll(),
            this.roleService.getAll(),
        ]).pipe(
            take(1),
            map(([users, roles]) => {
                const roleNames: { [key: string]: string } = {};
                if (roles) {
                    for (const r of roles) {
                        roleNames[r.level] = r.name;
                    }
                }
                return users.map(user => {
                    user.role = roleNames[user.role] ?? user.role;
                    return user;
                });
            })
        );
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
