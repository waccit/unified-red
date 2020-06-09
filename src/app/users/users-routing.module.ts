import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../authentication/auth.guard';
import { Role } from '../data'
import { UserTableComponent } from './view/user-table.component';

const routes: Routes = [
    {
        path: 'users',
        children: [
            {
                path: 'profile',
                component: ProfileComponent,
                canActivate: [AuthGuard],
                data: { roles: Role.Level1 },
            },
            {
                path: 'view',
                component: UserTableComponent,
                canActivate: [AuthGuard],
                data: { roles: Role.Level10 },
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
