import { identifierModuleUrl } from '@angular/compiler/compiler';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import * as io from 'socket.io-client';
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
  url:any;
  listSearch: string = '';
  category:any;
  map: any;
  loadi:any;
  marker: any;
  loading: any;
  search: boolean = false;
  error: any;
  switch: string = "map";
  location:any;
  regionals: any = [];
  currentregional: any;
  circles: any = [];
  socket:any = null;
  parking:any;
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
    this.url='34.253.145.31';
    this.parking=false;
    this.loadi=false;
    this.category='Welcome';
    this.platform.ready().then(() =>
      this.loadMaps());
    this.regionals = [{

    }];

    this.socket = io('http://'+this.url+':3500');
    this.socket.on('newco2', (msg) => {
      let posi=msg.location.split(" ");
      let position= new google.maps.LatLng(posi[0],posi[1]);
      for(let i=0;i<this.circles.length;i++){
        if (this.circles[i].position.lat()==posi[0]&&this.circles[i].position.lng()==posi[1]){
          this.circles[i].circle.setMap(null);
          this.circles[i].circle='';
          this.editCircleaire(position,msg.message,i);
        }
      }
    });
    this.socket.on('newparking', (msg) => {
      let posi=msg.location.split(" ");
      let position= new google.maps.LatLng(posi[0],posi[1]);
      for(let i=0;i<this.circles.length;i++){
        if (this.circles[i].position.lat()==posi[0]&&this.circles[i].position.lng()==posi[1]){
          this.circles[i].circle.setMap(null);
          this.circles[i].circle='';
          this.editCircleparquing(position,msg.message,i);
        }
      }

    });
    this.socket.on('newpeople', (msg) => {
      let posi=msg.location.split(" ");
      let position= new google.maps.LatLng(posi[0],posi[1]);
      for(let i=0;i<this.circles.length;i++){
        if (this.circles[i].position.lat()==posi[0]&&this.circles[i].position.lng()==posi[1]){
          this.circles[i].circle.setMap(null);
          this.circles[i].circle='';
          this.editCirclepeople(position,msg.message,i);
        }
      }

    });
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
  getpositionpeople(pos,observations){

    let positions = [];
    for(let i = 0; i<pos.length;i++){
      let posi=pos[i].split(" ");
      positions[i]= new google.maps.LatLng(posi[0],posi[1]);
    }
    this.addCirclepeople(positions,observations);
  }

  addCirclepeople(positions,level) {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].circle.setMap(null);
    }
    this.circles=[];
    for (let i = 0; i < positions.length; i++) {

      if (level[i] >= 0 && level[i] < 700) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#5ff442',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#5ff442',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 80
        });
        this.circles[i]={circle:this.circles[i],position:positions[i]}
      }
      if (level[i] >= 700 && level[i] < 1500) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#f77707',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f77707',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 80
        });
        this.circles[i]={circle:this.circles[i],position:positions[i]}
      }
      if (level[i] > 1500) {
        this.circles[i] = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: this.map,
          center: positions[i],
          radius: 80
        });
        this.circles[i]={circle:this.circles[i],position:positions[i]}
      }
    }
  }

  addCircleaire(positions,level) {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].circle.setMap(null);
    }
    this.circles=[];
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
      }
    }
  }

  addCircleparquing(positions,level) {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].circle.setMap(null);
    }
    this.circles=[];
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
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
        this.circles[i]={circle:this.circles[i],position:positions[i]}
      }
    }
  }

  editCircleparquing(position,level,index){
    if (level > 30) {
     let circle= new google.maps.Circle({
        strokeColor: '#5ff442',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#5ff442',
        fillOpacity: 0.35,
        map: this.map,
        center: position,
        radius: 250
      });
      this.circles[index].circle=circle;
    }
    if (level <= 30 && level > 10) {
      let circle=new google.maps.Circle({
        strokeColor: '#f7f71b',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f7f71b',
        fillOpacity: 0.35,
        map: this.map,
        center: position,
        radius: 250
      });
      this.circles[index].circle=circle;
    }
    if (level <= 10) {
       let circle= new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: this.map,
        center: position,
        radius: 250
      });
      this.circles[index].circle=circle;
    }
  }

  editCircleaire(positions,level,index) {
      if (level >= 350 && level < 1000) {
        let circle = new google.maps.Circle({
          strokeColor: '#5ff442',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#5ff442',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 250
        });
        this.circles[index].circle=circle;
      }
      if (level >= 1000 && level < 2000) {
        let circle= new google.maps.Circle({
          strokeColor: '#f7f71b',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f7f71b',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 250
        });
        this.circles[index].circle=circle;
      }
      if (level >= 2000 && level < 5000) {
        let circle = new google.maps.Circle({
          strokeColor: '#f77707',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f77707',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 250
        });
        this.circles[index].circle=circle;
      }
      if (level > 5000) {
       let circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 250
        });
        this.circles[index].circle=circle;
      }
    }

  editCirclepeople(positions,level,index) {
      if (level >= 0 && level < 700) {
        let circle = new google.maps.Circle({
          strokeColor: '#5ff442',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#5ff442',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 80
        });
        this.circles[index].circle=circle;
      }
      if (level >= 700 && level < 1500) {
        let circle = new google.maps.Circle({
          strokeColor: '#f77707',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f77707',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 80
        });
        this.circles[index].circle=circle;
      }
      if (level > 1500) {
        let circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: this.map,
          center: positions,
          radius: 80
        });
        this.circles[index].circle=circle;
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
    this.parking=false;
    this.category="Air Quality";
      this.http.get('http://'+this.url+'/air/sensor/air_quality_co2').map(res=>res.json()).subscribe(result=>{
        var locations = [];
        let observations=[];
        for (let i=0;i<result.length;i++){
          locations[i] = result[i].location;
          observations[i]=result[i].value;
        }
        this.getpositionaire(locations,observations);
        this.switch = "map";
      });
  }

  getallparquing(){
    this.parking=true;
    this.category="Parking Metrics";
    this.http.get('http://'+this.url+'/parking/sensor/park_meter').map(res=>res.json()).subscribe(result=>{
      var locations = [];
      let observations=[];
      for (let i=0;i<result.length;i++){
        locations[i] = result[i].location;
        observations[i]=result[i].value;
      }
      this.getpositionparquing(locations,observations);
      this.switch = "map"
    });
  }

  getallpeople(){
    this.parking=false;
    this.category="People Flow";
    this.http.get('http://'+this.url+'/people/sensor/people_flow').map(res=>res.json()).subscribe(result=>{
      var locations = [];
      let observations=[];
      for (let i=0;i<result.length;i++){
        locations[i] = result[i].location;
        observations[i]=result[i].value;
      }
      this.getpositionpeople(locations,observations);
      this.switch = "map";
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
  filterpark(number){
    this.loadi=true;
    this.geolocation.getCurrentPosition().then(
      (position) => {
          let data = { lat: position.coords.latitude, lon: position.coords.longitude };
        this.http.post('http://'+this.url+'/parking/nearParking',data).map(res=>res.json()).subscribe(result=>{
          var locations = [];
          let observations=[];
          for (let i=0;i<number;i++){
            locations[i] = result[i].latlon;
            observations[i]=result[i].value;
          }

          this.getpositionparquing(locations,observations);
          this.loadi=false;
          this.switch = "map";
        });
      },
      (error) => {

        });

  }

}
