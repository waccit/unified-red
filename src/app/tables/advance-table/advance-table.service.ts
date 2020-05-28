import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdvanceTable } from './advance-table.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
@Injectable()
export class AdvanceTableService {
    private readonly API_URL = 'assets/data/advanceTable.json';
    dataChange: BehaviorSubject<AdvanceTable[]> = new BehaviorSubject<
        AdvanceTable[]
    >([]);
    // Temporarily stores data from dialogs
    dialogData: any;
    constructor(private httpClient: HttpClient) {}
    get data(): AdvanceTable[] {
        return this.dataChange.value;
    }
    getDialogData() {
        return this.dialogData;
    }
    /** CRUD METHODS */
    getAllAdvanceTables(): void {
        this.httpClient.get<AdvanceTable[]>(this.API_URL).subscribe(
            (data) => {
                this.dataChange.next(data);
            },
            (error: HttpErrorResponse) => {
                console.log(error.name + ' ' + error.message);
            }
        );
    }
    // DEMO ONLY, you can find working methods below
    addAdvanceTable(advanceTable: AdvanceTable): void {
        this.dialogData = advanceTable;
    }
    updateAdvanceTable(advanceTable: AdvanceTable): void {
        this.dialogData = advanceTable;
    }
    deleteAdvanceTable(id: number): void {
        console.log(id);
    }
}
