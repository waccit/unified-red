import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDeleteDialogComponent } from './user-delete-dialog.component';

describe('UserDeleteDialogComponent', () => {
    let component: UserDeleteDialogComponent;
    let fixture: ComponentFixture<UserDeleteDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserDeleteDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserDeleteDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
