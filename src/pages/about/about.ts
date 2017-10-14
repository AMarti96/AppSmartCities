import { Component } from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {Http} from "@angular/http";
import { GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker} from "@ionic-native/google-maps";


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})

export class AboutPage {
  map: GoogleMap;
  mapElement: HTMLElement;
  constructor(public navCtrl: NavController,public http:Http,private googleMaps: GoogleMaps,public platform:Platform) {

      this.loadMap();

    //this.http.get('http://pollas/pollas').map(res=>res.json()).subscribe(result=>{});
    //let data='';
    //this.http.post('http://pollas/enviarpolla',data).map(res=>res.json()).subscribe(result=>{})
  }
  loadMap() {
    this.mapElement = document.getElementById('map');

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 43.0741904,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 30
      }
    };

    this.map = this.googleMaps.create(this.mapElement, mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        // Now you can use all methods safely.
        this.map.addMarker({
          title: 'Ionic',
          icon: 'blue',
          animation: 'DROP',
          position: {
            lat: 43.0741904,
            lng: -89.3809802
          }
        })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
                alert('clicked');
              });
          });

      });
  }

}
