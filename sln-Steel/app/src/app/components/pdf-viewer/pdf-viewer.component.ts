import { Component, ViewEncapsulation, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PDFViewerModel } from './models/pdf-viewer.model';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PDFViewerComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PDFViewerModel,
    public dialogRef: MatDialogRef<PDFViewerComponent>,
    private sanitizer: DomSanitizer
  ) {}

  // Variables
  BS64: any;

  ngOnInit(): void {
    this.BS64 = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.File);
  }

  Cerrar() {
    this.dialogRef.close();
  }
}
