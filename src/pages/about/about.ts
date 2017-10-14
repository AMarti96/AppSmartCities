import { Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {GoogleMap, GoogleMapsAnimation, GoogleMapsEvent, GoogleMapsLatLng, Geolocation, GoogleMapsMarkerOptions, GoogleMapsMarker, CameraPosition} from 'ionic-native';

declare var google;

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
    });
  }



  loadMap(){
    let location: GoogleMapsLatLng = new GoogleMapsLatLng(43.0741904,-89.3809802);

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
      // create CameraPosition
      let position: CameraPosition = {
        target: location,
        zoom: 18,
        tilt: 30
      };

      // move the map's camera to position
      this.map.moveCamera(position);

      // create new marker
      let markerOptions: GoogleMapsMarkerOptions = {
        position: location,
        title: 'Ionic'
      };

      this.map.addMarker(markerOptions)
        .then((marker: GoogleMapsMarker) => {
          marker.showInfoWindow();
        });
    });
  }

}
