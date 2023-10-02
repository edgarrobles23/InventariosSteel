import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class Next_Control {
    selectedInput: BehaviorSubject<number> = new BehaviorSubject<number>(1);
}
