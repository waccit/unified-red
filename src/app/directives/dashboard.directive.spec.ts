import { DashboardDirective } from './dashboard.directive';

describe('DashboardDirective', () => {
    it('should create an instance', () => {
        const directive = new DashboardDirective(
            this.appDashboard.viewContainerRef
        );
        expect(directive).toBeTruthy();
    });
});
