import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import * as $ from 'jquery';
import * as evothings from '../../libs/evothings/evothings.js'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public SYSTEMINFORMATIONSERVICE = 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07';
  public CHARACTERISTICS = {
    'ff51b30e-d7e2-4d93-8842-a7c4a57dfb08' : this.printMemory,
    'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09' : this.printUptime,
    'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10' : this.printLoadAverage
    };
  public connected = false;
  public devices = {};
  public device;

  constructor(public navCtrl: NavController) {

  }

  // document.addEventListener(
  //   'deviceready',
  //   function() { evothings.scriptsLoaded(this.initialize()) },
  //   false);
  
  // var app = {};
  
  // app.SYSTEMINFORMATIONSERVICE = 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07';
  
  // app.CHARACTERISTICS = {
  //             'ff51b30e-d7e2-4d93-8842-a7c4a57dfb08' : printMemory,
  //             'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09' : printUptime,
  //             'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10' : printLoadAverage
  //             };
  
  
  initialize() {
  
    this.connected = false;
  };
  
  startScan() {
  
    this.disconnect();
  
    console.log('Scanning started...');
  
    // app.devices = {};
  
    var htmlString =
      '<img src="img/loader_small.gif" style="display:inline; vertical-align:middle">' +
      '<p style="display:inline">   Scanning...</p>';
  
    $('#scanResultView').append($(htmlString));
  
    $('#scanResultView').show();
  
    function onScanSuccess(device) {
  
      if (device.name != null) {
  
        this.devices[device.address] = device;
  
        console.log('Found: ' + device.name + ', ' + device.address + ', ' + device.rssi);
  
        var htmlString =
          '<div class="deviceContainer" onclick="app.connectTo(\'' +
            device.address + '\')">' +
          '<p class="deviceName">' + device.name + '</p>' +
          '<p class="deviceAddress">' + device.address + '</p>' +
          '</div>';
  
        $('#scanResultView').append($(htmlString));
      }
    };
  
    function onScanFailure(errorCode) {
  
      // Show an error message to the user
      this.disconnect('Failed to scan for devices.');
  
      // Write debug information to console.
      console.log('Error ' + errorCode);
    };
  
    evothings.easyble.reportDeviceOnce(true);
    evothings.easyble.startScan(onScanSuccess, onScanFailure);
  
    $('#startView').hide();
  };
  
  receivedMessage(data) {
  
    if (this.connected) {
  
      // Convert data to String
      var message = String.fromCharCode.apply(null, new Uint8Array(data));
  
      // Update conversation 
      // this function doesn't seem to do anything
      // app.updateConversation(message, true);
  
      console.log('Message received: ' + message);
    }
    else {
  
      // Disconnect and show an error message to the user.
      this.disconnect('Disconnected');
  
      // Write debug information to console
      console.log('Error - No device connected.');
    }
  };
  
  
  setLoadingLabel(message) {
  
    console.log(message);
    $('#loadingStatus').text(message);
  };
  
  connectTo(address) {
  
    let device = this.devices[address];
  
    $('#loadingView').show();
  
    this.setLoadingLabel('Trying to connect to ' + device.name);
  
    function onConnectSuccess(device) {
  
      function onServiceSuccess(device) {
  
        // Application is now connected
        this.connected = true;
        this.device = device;
  
        console.log('Connected to ' + device.name);
  
        var htmlString = '<h2>' + device.name + '</h2>';
  
        $('#hostname').append($(htmlString));
  
        $('#scanResultView').hide();
        $('#loadingView').hide();
        $('#systemInformationView').show();
  
        Object.keys(this.CHARACTERISTICS).map(
          function(characteristic){
  
            device.readCharacteristic(
              characteristic,
              this.CHARACTERISTICS[characteristic],
              function(error){
  
                console.log('Error occured')
              });
        });
      }
  
      function onServiceFailure(errorCode) {
  
        // Disconnect and show an error message to the user.
        this.disconnect('Wrong device!');
  
        // Write debug information to console.
        console.log('Error reading services: ' + errorCode);
      }
  
      this.setLoadingLabel('Identifying services...');
  
      // Connect to the appropriate BLE service
      device.readServices(
        [this.SYSTEMINFORMATIONSERVICE],
        onServiceSuccess,
        onServiceFailure
      );
    }
  
    function onConnectFailure(errorCode) {
  
      this.disconnect('Disconnected from device');
  
      // Show an error message to the user
      console.log('Error ' + errorCode);
    }
  
    // Stop scanning
    evothings.easyble.stopScan();
  
    // Connect to our device
    console.log('Identifying service for communication');
    this.device.connect(onConnectSuccess, onConnectFailure);
  };
  
  
  disconnect(errorMessage?) {
  
    if (errorMessage) {
  
      // navigator.notification.alert(errorMessage, function() {});
      console.log('error with that navigator thing'); //@DEBUG
    }
  
    this.connected = false;
    this.device = null;
  
    // Stop any ongoing scan and close devices.
    evothings.easyble.stopScan();
    evothings.easyble.closeConnectedDevices();
  
    console.log('Disconnected');
  
    $('#scanResultView').empty();
    $('#hostname').empty();
    $('#memory').empty();
    $('#uptime').empty();
    $('#loadaverage').empty();
  
    $('#loadingView').hide();
    $('#scanResultView').hide();
    $('#systemInformationView').hide();
  
    $('#startView').show();
  };
  
  convertDataToObject(data) {
  
    return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(data)))
  }
  
  printUptime(data) {
  
    var uptime  = this.convertDataToObject(data).uptime;
  
    var days = Math.floor(uptime / 86400);
    uptime -= days * 86400;
  
    var hours = Math.floor(uptime / 3600) % 24;
    uptime -= hours * 3600;
  
    var minutes = Math.floor(uptime / 60) % 60;
  
    var htmlString = '<p>' + 'Uptime: ' + days + ' days, ' + hours + ':' + (minutes > 9 ? '' : '0') + minutes + '</p>';
  
    $('#uptime').append($(htmlString));
  };
  
  printMemory(data) {
  
    var freeMemory  = this.convertDataToObject(data).freeMemory;
    var totalMemory  = this.convertDataToObject(data).totalMemory;
  
    var htmlString = '<p>' +'Free memory: ' + freeMemory + '/' + totalMemory + '</p>';
  
    $('#memory').append($(htmlString));
  };
  
  printLoadAverage(data) {
  
    function colorLoad(load) {
  
      var color = '';
  
      if(load < 0.7) {
  
        color = 'color_wavegreen';
      }
      else if(load >= 1) {
  
        color = 'color_softred';
      }
      else {
  
        color = 'color_brightlight';
      }
  
      return '<span class="' + color + '">' + load + '</span>';
    }
  
    var dataObject = this.convertDataToObject(data);
  
    Object.keys(dataObject).map(function(load) {
  
      dataObject[load] = this.colorLoad(dataObject[load]);
    });
  
    var htmlString = '<p>' +'Load average: ' + dataObject.oneMin + ', ' + dataObject.fiveMin + ', ' + dataObject.fifteenMin + '</p>';
            ;
    $('#loadaverage').append($(htmlString));
  }
  

}
