import { Directive, Input, OnInit, ElementRef } from '@angular/core';
import { SeguridadService } from 'app/services/seguridad.service';

@Directive({
    selector: '[accessControl]',
})
export class AccessControl_Directive implements OnInit {
    @Input('IdOpcion') IdOpcion: string;
    @Input('Action') Action?: 'Insertar' | 'Borrar' | 'Modificar' | 'Imprimir';

    constructor(
        private elementRef: ElementRef,
        private _Seguridad: SeguridadService
    ) {}

    ngOnInit() {
        this.elementRef.nativeElement.style.display = 'none';
        this.CheckAccess();
    }

    CheckAccess() {
        const IdOpcion: number = parseInt(this.IdOpcion);
        const ExisteAccion = this._Seguridad.existeAccion(
            IdOpcion,
            this.Action
        );
        if (ExisteAccion) {
            this.elementRef.nativeElement.style.display = 'inline';
        } else {
            this.elementRef.nativeElement.remove();
        }
    }
}
