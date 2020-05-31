import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, merge } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export abstract class GenericDataSource<T> extends DataSource<T> {
    private dataSubject = new BehaviorSubject<T[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading = this.loadingSubject.asObservable();

    filterSubject = new BehaviorSubject('');
    get filter(): string {
        return this.filterSubject.value;
    }
    set filter(filter: string) {
        this.filterSubject.next(filter);
    }
    filteredData: T[] = [];
    renderedData: T[] = [];

    constructor(private paginator: MatPaginator, private sort: MatSort) {
        super();
        // Reset to the first page when the user changes the filter.
        this.filterSubject.subscribe(() => (this.paginator.pageIndex = 0));
        this.processData();
    }

    connect(): Observable<T[]> {
        // Listen for any changes in the base data, sorting, filtering, or pagination
        const displayDataChanges = [this.sort.sortChange, this.filterSubject, this.paginator.page];
        merge(...displayDataChanges)
            .pipe(tap(() => this.processData()))
            .subscribe();
        return merge(this.dataSubject);
    }

    disconnect() {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    private processData() {
        this.loadingSubject.next(true);
        this.dataSource()
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((data) => {
                this.filteredData = data.slice().filter((item: T) => {
                    const searchStr = this.searchColumns(item).join().toLowerCase();
                    return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
                });
                // Sort filtered data
                let sortedData = this.sortData(this.filteredData.slice());
                // Grab the page's slice of the data
                const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
                this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
                this.dataSubject.next(this.renderedData);
            });
    }

    private sortData(data: T[]): T[] {
        if (!this.sort.active || this.sort.direction === '') {
            return data;
        }
        return data.sort((a, b) => {
            let propertyA = a[this.sort.active];
            let propertyB = b[this.sort.active];
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }

    abstract dataSource(): Observable<T[]>;

    abstract searchColumns(item: T): string[];
}
