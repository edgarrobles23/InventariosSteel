/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { Subject, takeUntil } from 'rxjs';
@Component({
  template: '',
})
export abstract class BaseCustomComponent implements AfterViewInit {
  @ViewChild(MatSort)
  sort: MatSort | undefined;
  protected grid: any = {};
  private type: string = 'TableVirtualScrollDataSource';
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  protected constructor() {}
  ngAfterViewInit(): void {
    // If the user changes the sort order...
    this.sort?.sortChange.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      // Close the details
      this.closeDetails();
    });
  }
  abstract init(): boolean;

  protected initTable(columns: string[], type_: string = 'MatTableDataSource'): any {
    this.grid = {
      data: [],
      dataRaw: [],
      dataPrint: [],
      columns: columns,
      rowSelected: null,
      totalRows: 0,
    };
    this.type = type_;
    if (this.type == 'TableVirtualScrollDataSource') this.grid.data = new TableVirtualScrollDataSource<any>();
    if (this.type == 'MatTableDataSource') this.grid.data = new MatTableDataSource<any>();
  }

  protected setInfoInTable(data: any) {
    this.grid.totalRows = data.length;
    // this.grid.data = new MatTableDataSource(data);.
    if (this.type == 'TableVirtualScrollDataSource') this.grid.data = new TableVirtualScrollDataSource(data);
    if (this.type == 'MatTableDataSource') this.grid.data = new MatTableDataSource(data);
    this.grid.data.sort = this.sort;
    this.grid.dataRaw = data;
  }
  closeDetails(): void {
    this.grid.rowSelected = null;
  }

  toggleDetails(id: any, key: string) {
    // If the product is already selected...
    if (this.grid.rowSelected && this.grid.rowSelected[key] === id) {
      // Close the details
      this.closeDetails();
      return;
    }
    // Get the product by id
    this.grid.rowSelected = this.grid.dataRaw.find((it: any) => it[key] === id);
  }
  trackByFn(index: number, item: any): any {
    return item.IdUsuario || index;
  }

  handleKeyUp(e, key: string) {
    if (e.keyCode === 13) {
      this.closeDetails();
      const data = this.grid.dataRaw.filter((item: any) => {
        return item[key].toLowerCase().indexOf(e.target.value.toLowerCase()) > -1;
      });

      if (this.type == 'TableVirtualScrollDataSource') this.grid.data = new TableVirtualScrollDataSource(data);
      if (this.type == 'MatTableDataSource') this.grid.data = new MatTableDataSource(data);

      this.grid.totalRows = this.grid.data.length;
    }
  }
  resetData() {
    this.grid.data = new TableVirtualScrollDataSource<any>();
    this.grid.dataRaw = [];
    this.grid.rowSelected = null;
    this.grid.totalRows = 0;
  }
}
