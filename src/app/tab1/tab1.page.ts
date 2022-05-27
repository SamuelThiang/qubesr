import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { AlertController, LoadingController, Platform,NavController } from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/timeout';
import {DatePipe} from '@angular/common';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke
} from "ng-apexcharts";
import { concat } from "rxjs";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class Tab1Page implements OnInit{

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  alertCtrl: any;
  loading: any;
  startTime: string = new Date().toISOString()
  endTime: string = new Date().toISOString()
  datehide: boolean = false;
  outlethide: boolean = false;
  reportType = [];
  storeoutlet = [];
  storepath=[];
  outlet = [];
  showall = [];
  //topoutlet
  largest = "RM 0";
  store = "";

  //tophour
  largesthour = 0;
  hourcode ="";

  //topdept
  largetdept = "RM 0";
  deptstore="";

  //topsku
  largetsku = "RM 0";
  skustore="";

  dataB: any;
  selectedOutlet = [];
  reportTypeSelect: string = "SALES";
  title: string = "TOP SALES OUTLET";
  code = [];
  net = [];
  totalSales = "RM 0";
  topSales = "";
  topHour = "";
  totalTrx = "";
  d = new Date();
  dd = this.d.getDate();
  mm = this.d.getMonth() + 1;
  yy = this.d.getFullYear();
  date = this.yy + '-' + this.mm + '-' + this.dd;
  toDate = this.datePipe.transform(this.date,"yyyy-MM-dd");

  constructor(    
    public loadingController: LoadingController,
    private http: HttpClient,
    public platform: Platform,
    public cdRef: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private navCtrl: NavController) 
    
    {
    this.chartOptions = {
      series: [
        {
          name: "series1",
          data: [31, 40, 28, 51, 42, 109, 100]
        },
        {
          name: "series2",
          data: [11, 32, 45, 32, 34, 52, 41]
        }
      ],
      chart: {
        toolbar: {
          show:false
        },
        height: 250,
        type: "area"
    
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z"
        ]
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
  }
  
  ngOnInit() {
    this.getReportType();
    this.getstorelist();
    this.getTodayReport();
  }

  gettoplist(res)
  {
    this.showall = [];
    //console.log("gettoplist",res)

  }

  getReportType(){
    this.reportType = JSON.parse(localStorage.getItem('reportList')).filter((reportRes)=>{
      return reportRes.value == 'T'
    });
    console.log(this.reportType)
  }

  getColor()
  {
    const color = this.getRandomColor();
    return {
      'background-color':color
    }
  }

  getRandomColor()
  {
    var trans = '0.5'; // 50% transparency
     var color = 'rgba(';
     for (var i = 0; i < 3; i++) {
       color += Math.floor(Math.random() * 255) + ',';
      }
     color += trans + ')'; // add the transparency
      return color;
  }

  selectOutlet(outlet, index, event) {
    //console.log(event.target.checked);
    
    this.outlet[index].isCheck = event.target.checked;
    
  }

  returnDate(oldDate) {
    var date = new Date(oldDate);
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var newdate = year + month + day;
    var res = newdate.substr(2, newdate.length);
    return res;
  }

  changeDate()
  {
    console.log('Received Report From Start Date : ' + this.returnDate(this.startTime) + ' End Date : ' + this.returnDate(this.endTime));
    //this.getAllreport();
    this.datehide = !this.datehide;
  }

  changeOutlet() {
    var storepath ="";
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      console.log(this.storeoutlet);
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
        return x.value;
      });
      var resOutlet = storepath.substring(1);
      console.log(resOutlet);
      // this.outlethide =!this.outlethide;
      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'SALES' , resOutlet);
  }

  getTodayReport()
  {
    this.getsalesoutlet()
    
    this.gethouroutlet()

    this.getSKU()

    this.getdept()  
  }

  getdept()
  {
    let storepath = '';
    storepath = storepath + ',' + this.outlet.map(x=>{
    return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'DEPARTMENT', resOutlet).then((res:any)=>{
    // console.log(res)
    this.findTopdept(res);
    })
  }

  findTopdept(res)
  {
    console.log(res);
    var totals = res.reduce((c,x)=>
    {
      if(!c[x.Code]) c[x.Code] = {
          Desc: x.Desc,
          Code: x.Code, 
          Total: 0
      };
      c[x.Code].Total += Number(x.Net);
      return c;
    }, {});
  
    //var largest = 0;
    var number = null;
    let testnumber =0;
    for (var i in totals) {
      const tmplar = testnumber;
      // Update current number 
        number = totals[i].Total;
      // Compares stored largest number with current number, stores the largest one
      testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar){
            this.deptstore =  totals[i].Desc;
        }
         var t = (Math.round(testnumber * 100) / 100).toFixed(2);
         
      }
      console.log("abc",t);
      this.largetdept = ("RM " + t.toString());
     //console.log(this.largetdept,this.deptstore)    
  }

  getSKU()
  {    
    let storepath = '';
    storepath = storepath + ',' + this.outlet.map(x=>{
    return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'SKU', resOutlet).then((res:any)=>{
    // console.log(res)
    this.findTopsku(res);
    })
  }

  findTopsku(res)
  {
    console.log(res);
    var totals = res.reduce((c,x)=>
    {
      if(!c[x.Code]) c[x.Code] = {
          Desc: x.Desc,
          Code: x.Code, 
          Total: 0
      };
      c[x.Code].Total += Number(x.Net);
      return c;
    }, {});
  
    //var largest = 0;
    var number = null;
    let testnumber =0;
    for (var i in totals) {
      const tmplar = testnumber;
      // Update current number 
        number = totals[i].Total;
      // Compares stored largest number with current number, stores the largest one
      testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar){
            this.skustore =  totals[i].Desc;
        }
         var t = (Math.round(testnumber * 100) / 100).toFixed(2);
         
      }
      console.log("abc",t);
      this.largetsku = ("RM " + t.toString());
     console.log(this.largetsku,this.skustore) 
  }
  
  getsalesoutlet()
  {
    let storepath = '';
    storepath = storepath + ',' + this.outlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime), 'SALES' , resOutlet).then((res:any)=>{
      this.findTopOutlet(res);
      this.gettoplist(res)
      this.sumTotal(res);
      this.sumTotaltrx(res);
    })
  }

  findTopOutlet(res)
  {
    console.log(res);
    var totals = res.reduce((c,x)=>
    {
      if(!c[x.Code]) c[x.Code] = {
          Desc: x.Desc,
          Code: x.Code, 
          Total: 0
      };
      c[x.Code].Total += Number(x.Net);
      return c;
    }, {});
    
    //var largest = 0;
    var number = null;
    let testnumber = 0;
    
    for (var i in totals) {
      const tmplar = testnumber;
      // Update current number 
        number = totals[i].Total;
      // Compares stored largest number with current number, stores the largest one
        testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar){
            this.store =  totals[i].Desc;
        }
        var t = (Math.round(testnumber * 100) / 100).toFixed(2);
       
      }
     //console.log("console total",totals)
     this.largest = ("RM " + t.toString());

     var toarr = Object.values(totals);
     //var sort = sort.sortBy(toarr,["Total","Desc"]);
     console.log("toarr",toarr)
  }

  gethouroutlet()
  {
    let storepath = '';
    storepath = storepath + ',' + this.outlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'HOURLY' , resOutlet).then((res:any)=>{
      //console.log(res)
      this.findTopHour(res);
    })
  }

  findTopHour(res)
  {    
    //console.log(res);
    var totalshour = res.reduce((c,x)=>
    {
      if(!c[x.Code]) c[x.Code] = {
          Code: x.Code, 
          Total: 0
      };
      c[x.Code].Total += Number(x.Net);
      return c;
    }, {});

    //console.log(totalshour);
    var number = null;
    
    for (var i in totalshour) {
      const tmplar = this.largesthour;
      // Update current number 
        number = totalshour[i].Total;
      // Compares stored largest number with current number, stores the largest one
        this.largesthour = Math.max(this.largesthour, number);
        if(this.largesthour !== tmplar){
            this.hourcode =  totalshour[i].Code;
            //console.log(this.hourcode)
        }
      }
      //console.log(this.largesthour,this.hourcode)
  }

  showSetDate() {
    if (this.outlethide) {
      this.outlethide = !this.outlethide;
    }
    this.datehide = !this.datehide;
  }

  showSetOutlet() {
    if (this.datehide) {
      this.datehide = !this.datehide;
    }
    this.outlethide = !this.outlethide;
  }

  getstorelist()
  {
    this.outlet = JSON.parse(localStorage.getItem('storeList'));
  }

  sumTotal(array){
    let total = 0;
    for(let i of array){
      total = total + parseFloat(i.Net);
      var t = (Math.round(total * 100) / 100).toFixed(2);
    }
    this.totalSales = ("RM " + t.toString());
   
  }

  sumTotaltrx(array){
    let total = 0;
    for(let i of array){
      total = total + parseFloat(i.Trx);
    }
    this.totalTrx = total.toString();
  }
  
  async getReport(StartDate, EndDate, ReportType, outletArray) 
  {
    //SEND USERNAME & PASSWORD TO SERVER CHECK LOGIN
    let postData = new URLSearchParams();
    postData.append('reportType', ReportType);
    postData.append('path', outletArray);
    postData.append('StartDate', StartDate);
    postData.append('EndDate', EndDate);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    return this.http.post('https://qubelive.com.my/QubeSR/User/salereportAll.php', postData.toString(), httpOptions).timeout(10000).toPromise();
  }

  public generateData(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

      series.push([x, y, z]);
      baseval += 86400000;
      i++;
    }
    return series;
  }

  onButtonTitleClicked(event, item) {
    // event.stopPropagation();
    this.reportTypeSelect = item.name;
    console.log(item.name);
    switch (item.name) {
      case 'HOURLY':
        this.title = 'TOP HOURLY';
        break;
      case 'SKU':
          this.title = 'TOP SKU';
        break;
      case 'DEPARTMENT':
          this.title = 'TOP DEPARTMENT';
        break;
      case 'SALES':
          this.title = 'TOP SALES OUTLET';
        break;
    }
    
  }

}