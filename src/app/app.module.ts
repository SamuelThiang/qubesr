import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Device } from '@ionic-native/device/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { FTP } from '@ionic-native/ftp/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File } from '@ionic-native/file/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { Network } from '@ionic-native/network/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DecimalPipe } from '@angular/common';
import {DatePipe} from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(),ReactiveFormsModule, AppRoutingModule,DateRangePickerModule,BrowserAnimationsModule,FormsModule,MatDatepickerModule,MatInputModule,MatFormFieldModule,],
  providers: [
    StatusBar,
    SplashScreen,
    UniqueDeviceID,
    Device,
    SpinnerDialog,
    FTP,
    AndroidPermissions,
    File,
    SQLite,
    Network,
    DecimalPipe,
    DatePipe,
    NativeStorage,
    
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
