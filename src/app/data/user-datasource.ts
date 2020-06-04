import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { formatDate } from '@angular/common';

import { UserService } from '../services';
import { GenericDataSource } from './generic-datasource';
import { User } from './user.model';

export class UserDataSource extends GenericDataSource<User> {
    constructor(private userService: UserService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
    }

    dataSource() {
        return this.userService.getAll();
    }

    searchColumns(item: User) {
        return [
            item.username,
            item.firstName,
            item.lastName,
            item.email,
            item.enabled ? 'enabled' : 'disabled',
            item.expirationDate ? formatDate(item.expirationDate, 'MM/dd/yyyy', 'en') : '',
        ];
    }
}
