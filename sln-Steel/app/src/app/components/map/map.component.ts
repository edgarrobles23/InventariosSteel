/* eslint-disable id-blacklist */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable curly */
/* eslint-disable new-parens */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @angular-eslint/no-output-rename */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnInit, Output,NgZone, ViewChild, ElementRef} from '@angular/core';
import { Subject } from 'rxjs';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    @Input() ParamsMap: any ={Latitude:0,Longitude:0,Zoom:0};
    @Input() classCustom: string;
    @Output() MapEvent: Subject<any>= new EventEmitter<any>();

    @ViewChild("search") public searchElementRef: ElementRef;
    address: string;
    public geoCoder;
    initialLoading: boolean= false;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
      //Convertir las coordenadas a number
     this.ParamsMap.Latitude=parseFloat(this.ParamsMap.Latitude);
     this.ParamsMap.Longitude=parseFloat(this.ParamsMap.Longitude);
     this.initialLoading=  true;
  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(){
    this.mapsAPILoader.load().then(() => {
      //Init Map
      this.geoCoder = new google.maps.Geocoder;
      this.setCurrentLocation();
      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
          types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
              const place = autocomplete.getPlace();
              if (place.geometry === undefined || place.geometry === null) {
                  return;
              }
              if (place && place.address_components) {
                  this.setAddressInForm(place);
                  //set latitude, longitude and zoom
                  this.ParamsMap.Latitude = place.geometry.location.lat();
                  this.ParamsMap.Longitude = place.geometry.location.lng();
                  this.ParamsMap.Zoom = 16;
                //   this.setAddressInFormLatAndLong(this.latitude, this.longitude);
              }

          });
      });
  });
 }

 //Extract direccion
 private searchItem(key: string, place: any): string {
  const adress=place.address_components;
 try {
  for (let i = 0; i < adress.length; i++) {
      const arrayTypes=adress[i].types;
      if (arrayTypes.find(it => it===key)) {
          return adress[i]['long_name'] || adress[i]['short_name'];
      }
  }
 } catch (error) {
  return '';
 }
}

 // Get Current Location Coordinates
private setCurrentLocation() {
  if ('geolocation' in navigator) {
      if(this.ParamsMap.Latitude)
      {
        this.ParamsMap.Latitude= parseFloat(this.ParamsMap.Latitude);
        this.ParamsMap.Longitude = parseFloat(this.ParamsMap.Longitude);
        this.ParamsMap.Zoom = 18;
        this.getAddress();
      }else
        navigator.geolocation.getCurrentPosition((position) => {
            this.ParamsMap.Latitude=  position.coords.latitude;
            this.ParamsMap.Longitude= position.coords.longitude;
            this.ParamsMap.Zoom = 18;
            this.getAddress();
        });
  }
}

markerDragEnd($event: any) {
    this.ParamsMap.Latitude = $event.coords.lat;
    this.ParamsMap.Longitude = $event.coords.lng;
    this.getAddress();
}

getAddress() {
  this.geoCoder.geocode({ 'location': { lat: this.ParamsMap.Latitude, lng: this.ParamsMap.Longitude } }, (results, status) => {
    if (status === 'OK') {
      if (results[0]) {
        this.ParamsMap.Zoom = 18;
        this.setAddressInForm(results[0]);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }

  });
}

setAddressInForm(address: any){
  let returnValues={
                    Calle: this.searchItem('route', address),//calle
                    NumeroExterior: this.searchItem('street_number', address),//numero
                    Colonia: this.searchItem('sublocality_level_1', address),//colonia
                    CodigoPostal :this.searchItem('postal_code', address),//C.P
                    Ciudad :this.searchItem('locality', address),//cuidad
                    Estado :this.searchItem('administrative_area_level_1', address),//Estado
                    Pais :this.searchItem('country', address),//Pais
                    Latitude:this.ParamsMap.Latitude,
                    Longitude:this.ParamsMap.Longitude

  };

  if(!this.initialLoading)
    this.MapEvent.next(returnValues);
  else
    this.initialLoading=false;
}
}
