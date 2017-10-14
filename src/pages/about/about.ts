import { Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {GoogleMap, GoogleMapsAnimation, GoogleMapsEvent, GoogleMapsLatLng, Geolocation, GoogleMapsMarkerOptions, GoogleMapsMarker, CameraPosition} from 'ionic-native';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  map: GoogleMap;
  url: any;

  constructor(public navCtrl: NavController, private platform: Platform, public http:Http) {
    platform.ready().then(() => {
      this.loadMap();
      console.log("Mapa cargado")
    });
  }

  loadMap(){
    let location = new GoogleMapsLatLng(-34.9290,138.6010);

    this.map = new GoogleMap('map', {
      'backgroundColor': 'white',
      'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      },
      'camera': {
        'latLng': location,
        'tilt': 30,
        'zoom': 15,
        'bearing': 50
      }
    });

    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
      console.log('Map is ready!');
    });

  }

}
