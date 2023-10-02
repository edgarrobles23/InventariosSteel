/* eslint-disable curly */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @angular-eslint/no-output-rename */
/* eslint-disable @typescript-eslint/naming-convention */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {  ControlValueAccessor,FormControl,NG_VALUE_ACCESSOR} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from 'app/services/helper.service';
import { SystemService } from 'app/services/system.service';
import { Subject } from 'rxjs';
// eslint-disable-next-line no-var
 // declare var require: any;
  declare function require(name: string): string;

@Component({
    selector: 'image-picker',
    templateUrl: './image-picker.component.html',
    styleUrls: ['./image-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: ImagePickerComponent,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ImagePickerComponent implements OnInit, ControlValueAccessor {
    @Input() classCustom: string;
    @Input() disabled: boolean = false;
    @Input() Required: boolean = true;
    @Output('imagenCambiada') imagenCambiada: Subject<string> =
        new EventEmitter<string>();
    @ViewChild('imagen') inputImagen: ElementRef;

    file: {
        base64: string;
        height: number;
        name: string;
        size: number;
        width: number;
    };
    imagen: File;
    imagenDefault;//=require('./no-photos.png');
    formImagen: FormControl = new FormControl(null);

    constructor(
        public _helper: HelperService,
        private _notify: SystemService.Notify,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sanitizer: DomSanitizer
    ) {
        this.imagenDefault='assets/images/no-photos.png';
    }

    writeValue(obj: any): void {
        if (obj) {
            this.checkImagen(obj)
                .then((cargada) => {
                    this.formImagen.patchValue(obj);
                })
                .catch((err) => {
                    fetch('no-photos.png').then((res) => {
                        res.blob().then((resTxt) => {
                            const img = this._sanitizer.bypassSecurityTrustUrl(
                                URL.createObjectURL(resTxt)
                            );
                            this.formImagen.patchValue(img);
                        });
                    });
                })
                .finally(() => this._changeDetectorRef.markForCheck());
        } else {
            this.formImagen.patchValue('');
            this._changeDetectorRef.markForCheck();
        }
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    checkImagen(src: string) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
        });
    }

    onChange = (b64: string) => {};
    onTouched = () => {};
    touched: boolean = false;

    ngOnInit(): void {
        // this.formImagen.valueChanges.subscribe((b64) => {
        //     this.imagenCambiada.next(b64);
        // });
    }

    clickImagen() {
        if (this.disabled) return;
        this.markAsTouched();
        this.inputImagen.nativeElement.click();
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    imagenSeleccionada(file: FileList) {
        if (this.disabled) return;
        if (file.length === 0) {
            this._notify.notifyInfo('No se seleccionó una imágen');
        } else {
            const imagen = file.item(0);
            this.imagen = imagen;

            if (!/image/i.test(imagen.type)) {
                this._notify.notifyError('No es un archivo de imágen');
                return;
            }

            this._helper.getInfoImage(imagen).then((info) => {
                this.file = info;
                this.formImagen.patchValue(info.base64.toString());
                this.onChange(info.base64.toString());
                this.imagenCambiada.next(this.formImagen.value);
                this._changeDetectorRef.markForCheck();
            });
        }
    }
}
