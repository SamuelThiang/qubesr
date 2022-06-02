import { Component } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Device } from '@ionic-native/device/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { Network } from '@ionic-native/network/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
  export class LoginPage {

    info: string = "";
    inputEmail: string = "";
    inputPass: string = "";
    loading: any;
    donwloadReport: any;
    donwloadStore: any;
    list: Array<any> = [];
    allData: string = "";
    expDate: string = "";
    dataB: any;
    remembercheck: boolean = false;
  
    constructor(
      private alertCtrl: AlertController,
      private http: HttpClient,
      private device: Device,
      public loadingController: LoadingController,
      private sqlite: SQLite,
      public platform: Platform,
      private router: Router,
      private auth: AuthenticationService,
      private network: Network,
      private nativeStorage: NativeStorage
    ) {
      this.platform.ready().then(() => {
        this.listenConnection();
        this.nativeStorage.getItem('rmbacc')
          .then(
            data => {
              if (data != '') {
                this.inputEmail = data.id;
                this.inputPass = data.pass;
                this.remembercheck = data.ischeck;
              }
            },
            error => console.error("empty user & pass :", error)
          );
  
      });
    }
  
    //LOGING RESULT
    async showalert(res, msg, path) {
      this.loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: msg,
        buttons: [{
          text: 'OK',
          handler: () => {
            if (res == '1') {
              this.dlReportList(path);
            } else {
              alert.dismiss();
            };
          }
        }]
      });
      await alert.present();
    }
    async showOKAY(res) {
      const alert = await this.alertCtrl.create({
        header: res,
        buttons: [{ text: 'OK' }]
      });
      await alert.present();
    }
  
    //READ REPORTLIST FROM SERVER & SAVE TO SQLITE
    async dlReportList(path) {
      this.donwloadReport = await this.loadingController.create({
        message: 'LOADING REPORT LIST...',
      });
      this.donwloadReport.present();
  
      let postData = new URLSearchParams();
      postData.append('operation', 'reportList');
      postData.append('path', path);
  
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
  
      this.http.post('https://qubelive.com.my/QubeSR/User/ListAll.php', postData.toString(), httpOptions).subscribe((response: any) => {
      localStorage.setItem('reportList',JSON.stringify(response));
      this.dlStoreList(path);
        this.donwloadReport.dismiss();
      }, error => {
        console.error(error);
        this.donwloadReport.dismiss();
      });
    }

    //READ STORELIST FROM SERVER & SAVE TO SQLITE
    async dlStoreList(path) {
      this.donwloadStore = await this.loadingController.create({
        message: 'LOADING STORE LIST...',
      });
      this.donwloadStore.present();
  
      let postData = new URLSearchParams();
      postData.append('operation', 'storeList');
      postData.append('path', path);
  
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
  
      this.http.post('https://qubelive.com.my/QubeSR/User/ListAll.php', postData.toString(), httpOptions).subscribe((response: any) => {
        if(response.length > 0){
          for(let i of response){
            i.isCheck = true;
          }
          localStorage.setItem('storeList',JSON.stringify(response))
          console.log(JSON.parse(localStorage.getItem('storeList')))
          this.checkDB();
        }
        this.donwloadStore.dismiss();
      }, error => {
        console.error(error);
        this.donwloadStore.dismiss();
      });
    }
  
    // LOGIN 
    async presentAlert(email, pass) {
      this.loading = await this.loadingController.create({
        message: 'Loging...',
      });
      this.loading.present();
  
      //SEND USERNAME & PASSWORD TO SERVER CHECK LOGIN
      let postData = new URLSearchParams();
      postData.append('email', email);
      postData.append('password', pass);
      postData.append('imei', this.device.uuid);
      postData.append('device', this.device.platform);
  
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
  
      this.http.post('https://qubelive.com.my/QubeSR/User/login.php', postData.toString(), httpOptions).subscribe((response: any) => {
        this.expDate = response['expDate'];
        this.showalert(response['status'], response['message'], response['path']);
        if (this.remembercheck) {
          this.nativeStorage.setItem('rmbacc', { 'id': email, 'pass': pass, 'ischeck': 'true' })
            .then(
              () => console.log('Remember Account!'),
              error => console.error('Remember Account Failed', error)
            );
        } else {
          this.nativeStorage.remove('rmbacc')
            .then(
              () => console.log('Removed Account!'),
              error => console.error('Removed Account Failed', error)
            );
        }
        console.log('LOGIN SUCCESSFUL');
      }, error => {
        this.showalert('e', 'Server Down...', '');
        console.log('LOGIN FAILED : ', error);
      });
      setTimeout(() => {
        console.log("timeout")
        this.loading.dismiss();
      }, 1000);
    }
  
    async checkDB() {
      let data = {
        "getDeviceID": this.device.uuid,
        "getDeviceName": this.device.model,
        "getExpDate": this.expDate,
        "getUser": this.inputEmail,
        "getPass": this.inputPass
      };
      localStorage.setItem('setting', JSON.stringify(data));
      this.auth.setLoggedIn(true)
      this.router.navigateByUrl('/tab1');
    }
    private listenConnection(): void {
      this.network.onDisconnect()
        .subscribe(() => {
          this.showAlert();
        });
    }
  
    async showAlert() {
      const alert = await this.alertCtrl.create({
        header: 'No Internet Access',
        message: 'Please open internet connection to countinue',
        buttons: ['OK']
      });
  
      await alert.present();
    }
    rememberme(event) {
      if (event.target.checked) {
        this.remembercheck = true;
  
      } else {
        this.remembercheck = false;
      }
    }
    async forgetPass() {
      let alert = await this.alertCtrl.create({
        header: 'Reset Password',
        message: 'Enter Your Email For Received New Reset Password',
        inputs: [
          {
            name: 'Email',
            placeholder: 'Email'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Send Email',
            handler: data => {
              this.resetMail(data.Email);
            }
          }
        ]
      });
      await alert.present();
    }
    async resetMail(email) {
      this.loading = await this.loadingController.create({
        message: 'Sending Reset Password To Your Email...',
      });
      this.loading.present();
  
      let postData = new URLSearchParams();
      postData.append('email', email);
  
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
  
      this.http.post('https://qubelive.com.my/QubeSR/User/resetmail.php', postData.toString(), httpOptions).subscribe((response: any) => {
        if (response['status'] == '1') {
          this.resultAlert('Successful', 'Please Check Your Email!');
          this.loading.dismiss();
        }else{
          this.resultAlert('Failed', 'Please Try Again Later...');
          this.loading.dismiss();
        }
      }, error => {
        console.log('Reset mail FAILED : ', error);
      });
      setTimeout(() => {
        console.log("timeout")
        this.loading.dismiss();
      }, 10000);
    }
    async resultAlert(header, msg) {
      const alert = await this.alertCtrl.create({
        header: header,
        message: msg,
        buttons: [{
          text: 'OK',
          handler: () => {
            alert.dismiss();
          }
        }]
      });
      await alert.present();
    }
  }
  
  