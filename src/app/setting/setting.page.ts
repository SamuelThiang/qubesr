import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  inputUser: string = "-";
  inputPass: string = "-";
  inputDevice: string = "-";
  inputDeviceID: string = "-";
  inputExpireDate: string = "-";
  inputAppVer: string = "-";
  alertlogout: any;
  loading: any;
  currentmail:string = "";
  oldpass: string = "";

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private auth: AuthenticationService,
    private http: HttpClient,
    public loadingController: LoadingController
    ) { }

  ngOnInit() {
    let data = JSON.parse(localStorage.getItem('setting'));
    console.log("Did data load? : ", data);
    this.inputUser = data.getUser;
    this.currentmail = data.getUser;
    var pass = data.getPass;
    this.oldpass = data.getPass;
    var char = pass.length;
    var password = "";
    for (var i = 0; i < char; i++) {
      password += "*";
    }
    this.inputPass = password;
    this.inputDevice = data.getDeviceName;
    this.inputDeviceID = data.getDeviceID;
    this.inputExpireDate = data.getExpDate;
    this.inputAppVer = '1.0.4';
  }

  async changePass() {
    let alert = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'oldPassword',
          type: 'password',
          placeholder: 'Old Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
        {
          name: 'repeatPassword',
          type: 'password',
          placeholder: 'Repeat New Password'
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
            if(data.oldPassword == this.oldpass){
              if(data.newPassword == data.repeatPassword){
                this.changePwd(data.newPassword,this.currentmail);
              }else{
                this.resultAlert('Failed','New Password Not Same With Repeat Password');
              }
            }else{
              this.resultAlert('Failed','Wrong Old Password');
            }
          }
        }
      ]
    });
    await alert.present();
  }
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'LOGOUT',
      message: "ARE YOU SURE TO LOGOUT?",
      buttons: [{
        text: 'NO',
        handler: () => {
          console.log('cancel logout');
          alert.dismiss();
        }
      }, {
        text: 'YES',
        handler: () => {
          console.log('logout');
          localStorage.clear();
          this.auth.setLoggedIn(false)
          this.router.navigateByUrl('/home', { skipLocationChange: true });

        }
      }]
    });
    await alert.present();
  }
  async changePwd(newPass,email){
    this.loading = await this.loadingController.create({
      message: 'Changing Password...',
    });
    this.loading.present();

    let postData = new URLSearchParams();
    postData.append('email', email);
    postData.append('password', newPass);

    console.log(email.newPass);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    this.http.post('https://qubelive.com.my/QubeSR/User/chgpwd.php', postData.toString(), httpOptions).subscribe((response: any) => {
      if (response['status'] == '1') {
        this.resultAlert('Successful', 'Your Password Changed Succesfully');
        this.loading.dismiss();
      }else{
        this.resultAlert('Failed', 'Please Try Again Later....');
        this.loading.dismiss();
      }
    }, error => {
      console.log('Change Password FAILED : ', error);
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
