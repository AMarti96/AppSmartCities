import { identifierModuleUrl } from '@angular/compiler/compiler';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import {Http} from "@angular/http";

declare var google: any;
declare var MarkerClusterer: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;

  listSearch: string = '';

  map: any;
  marker: any;
  loading: any;
  search: boolean = false;
  error: any;
  switch: string = "map";
  location:any;
  regionals: any = [];
  currentregional: any;
  circles: any = [];

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: App,
    public nav: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public geolocation: Geolocation,
    public http:Http
  ) {
    this.platform.ready().then(() => this.loadMaps());
    this.regionals = [{
      "title": "Marker 1",
      "latitude": 52.50094,
      "longitude": 13.29922,
    }, {
      "title": "Marker 2",
      "latitude": 49.1028606,
      "longitude": 9.8426116
    }];
  }

  viewPlace(id) {
    console.log('Clicked Marker', id);
  }


  loadMaps() {
    if (!!google) {
      this.initializeMap();
      this.initAutocomplete();
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }

  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.loadMaps();
          }
        }
      ]
    });
    alert.present();
  }

  mapsSearchBar(ev: any) {
    // set input to the value of the searchbar
    //this.search = ev.target.value;
    console.log(ev);
    const autocomplete = new google.maps.places.Autocomplete(ev);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          sub.next(place.geometry.location);
          sub.complete();
        }
      });
    });
  }

  initAutocomplete(): void {
    // reference : https://github.com/driftyco/ionic/issues/7223
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);

      let options = {
        center: location,
        zoom: 10
      };
      this.map.setOptions(options);
      this.addMarker(location, this.addressElement);

    });
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          console.log('Search Lat', place.geometry.location.lat());
          console.log('Search Lng', place.geometry.location.lng());
          sub.next(place.geometry.location);
          //sub.complete();
        }
      });
    });
  }

  followlocation(){

    console.log("empiezo a seguir posicion")

    const watch = this.geolocation.watchPosition().subscribe(pos => {
      var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      this.marker.setPosition(latlng);
    });
  }

  initializeMap() {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        zoom: 10,
        center: { lat: 41.378866, lng: 2.150188 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: false,
        disableDefaultUI: true,
        zoomControl: true,
        scaleControl: true,
      });
      this.getCurrentPosition();
      /*let markers = [];
      for (let regional of this.regionals) {
        regional.distance = 0;
        regional.visible = false;
        regional.current = false;

        let markerData = {
          position: {
            lat: regional.latitude,
            lng: regional.longitude
          },
          map: this.map,
          title: regional.title,
        };

        regional.marker = new google.maps.Marker(markerData);
        markers.push(regional.marker);

        regional.marker.addListener('click', () => {
          for (let c of this.regionals) {
            c.current = false;
            //c.infoWindow.close();
          }
          this.currentregional = regional;
          regional.current = true;

          //regional.infoWindow.open(this.map, regional.marker);
          this.map.panTo(regional.marker.getPosition());
        });
      }

      new MarkerClusterer(this.map, markers, {
        styles: [
          {
            height: 53,
            url: "assets/img/cluster/MapMarkerJS.png",
            width: 53,
            textColor: '#fff'
          },
          {
            height: 56,
            url: "assets/img/cluster/MapMarkerJS.png",
            width: 56,
            textColor: '#fff'
          },
          {
            height: 66,
            url: "assets/img/cluster/MapMarkerJS.png",
            width: 66,
            textColor: '#fff'
          },
          {
            height: 78,
            url: "assets/img/cluster/MapMarkerJS.png",
            width: 78,
            textColor: '#fff'
          },
          {
            height: 90,
            url: "assets/img/cluster/MapMarkerJS.png",
            width: 90,
            textColor: '#fff'
          }
        ]
      });*/




      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        //this.bounceMap(markers);
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.zone.run(() => {
          this.resizeMap();
        });
      });


    });
  }

  //Center zoom
  //http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
  bounceMap(markers) {
    let bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }



  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  choosePosition() {
    this.storage.get('lastLocation').then((result) => {
      if (result) {
        let actionSheet = this.actionSheetCtrl.create({
          title: 'Last Location: ' + result.location,
          buttons: [
            {
              text: 'Reload',
              handler: () => {
                this.getCurrentPosition();
              }
            },
            {
              text: 'Delete',
              handler: () => {
                this.storage.set('lastLocation', null);
                this.showToast('Location deleted!');
                this.initializeMap();
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        actionSheet.present();
      } else {
        this.getCurrentPosition();

      }
    });
  }

  // go show currrent location
  getCurrentPosition() {
    this.loading = this.loadingCtrl.create({
      content: 'Searching Location ...'
    });
    this.loading.present();

    let locationOptions = { timeout: 10000, enableHighAccuracy: true };

    this.geolocation.getCurrentPosition(locationOptions).then(
      (position) => {
        this.loading.dismiss().then(() => {

          this.showToast('Location found!');
          console.log("consegui posicion");

          let myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let options = {
            center: myPos,
            zoom: 14
          };
          this.map.setOptions(options);
          this.addMarker(myPos, "My location!");

                  let lastLocation = { lat: position.coords.latitude, long: position.coords.longitude };
                  this.storage.set('lastLocation', lastLocation).then(() => {
                  });
          this.followlocation();
        });
      },
      (error) => {
        this.loading.dismiss().then(() => {
          this.showToast('Location not found. Please enable your GPS!');

          console.log(error);
        });
      }
    )
  }

  toggleSearch() {
    if (this.search) {
      this.search = false;
    } else {
      this.search = true;
    }
  }

  getpositionaire(pos,observations){

    let positions = [];
    for(let i = 0; i<pos.length;i++){
      let posi=pos[i].split(" ");
      positions[i]= new google.maps.LatLng(posi[0],posi[1]);
    }
    this.addCircleaire(positions,observations);
  }
  getpositionparquing(pos,observations){

    let positions = [];
    for(let i = 0; i<pos.length;i++){
      let posi=pos[i].split(" ");
      positions[i]= new google.maps.LatLng(posi[0],posi[1]);
    }
    this.addCircleparquing(positions,observations);
  }



  addCircleaire(positions,level) {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].setMap(null);
    }
    for (let i = 0; i < positions.length; i++) {

      if (level[i] >= 350 && level[i] < 1000) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#5ff442',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#5ff442',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
      if (level[i] >= 1000 && level[i] < 2000) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#f7f71b',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f7f71b',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
      if (level[i] >= 2000 && level[i] < 5000) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#f77707',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f77707',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
      if (level[i] > 5000) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
    }
  }

  addCircleparquing(positions,level) {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].setMap(null);
    }
    for (let i = 0; i < positions.length; i++) {

      if (level[i] >= 30) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#5ff442',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#5ff442',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
      if (level[i] <= 30 && level[i] > 10) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#f7f71b',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f7f71b',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
      if (level[i] <= 10) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 250
        });
      }
    }
  }
  addMarker(position, content) {

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: position
    });

    this.marker = marker;

    this.addInfoWindow(marker, content);
    return marker;
  }

  getallaire(){
      this.http.get('http://10.192.53.5:3500/air/6772696769746f').map(res=>res.json()).subscribe(result=>{
        var locations = [];
        let observations=[];
        for (let i=0;i<result.sensors.length;i++){
          locations[i] = result.sensors[i].observations[0].location;
          observations[i]=result.sensors[i].observations[0].value;
        }
        this.getpositionaire(locations,observations);
        this.switch = "map";
      });
  }

  getallparquing(){
    this.http.get('http://10.192.53.5:3500/parking/6d61736d69').map(res=>res.json()).subscribe(result=>{
      var locations = [];
      let observations=[];
      for (let i=0;i<result.sensors.length;i++){
        locations[i] = result.sensors[i].observations[0].location;
        observations[i]=result.sensors[i].observations[0].value;
      }
      this.getpositionparquing(locations,observations);
      this.switch = "map"
    });
  }

  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

}
