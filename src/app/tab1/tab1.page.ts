import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { AlertController, LoadingController, Platform,NavController } from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import 'rxjs/add/operator/timeout';
import {DatePipe} from '@angular/common';
import {FormControl} from '@angular/forms';
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
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

export class Tab1Page implements OnInit{

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  
  alertCtrl: any;
  loading: any;
  getstartdate: string;
  qtn :number = 10;
  startTime: string = new Date().toISOString()
  endTime: string = new Date().toISOString()
  datehide: boolean = false;
  outlethide: boolean = false;
  TopOutletclicked: boolean =true;
  TopDeptclicked:boolean = false;
  TopSKUclicked:boolean =false;
  TopHourclicked:boolean =false;
  TopWeeklyDeptClicked :boolean =false;
  checkReportType: boolean = false;
  reportType = [];
  storeoutlet = [];
  storepath=[];
  showall =[];
  showallsku =[];
  showallDept =[];
  showtotal =[];
  outlet = [];
  toarr =[];
  toarrDept =[];
  toarrSku=[];
  toarrHour=[];
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

  selfStart:string;
  selfEnd:string;
  autocount = 0;
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
  monthStartConvert : string;
  monthEndConvert : string;
  //date = this.yy + '-' + this.mm + '-' + this.dd;
  //toDate = this.datePipe.transform(this.date,"yyyy-MM-dd");

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
          height: 350,
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
    this.getWeeklyData(); 
  }

  date = new FormControl(moment());

  startC(event:any)
  {
    this.selfStart = event.value;
    this.selfStart = this.datePipe.transform(this.selfStart,'yyMMdd');
    console.log("selfstart",this.selfStart)
  }
  endC(event:any)
  {
    this.selfEnd = event.value;
    this.selfEnd = this.datePipe.transform(this.selfEnd,'yyMMdd');
    console.log("selfEnd",this.selfEnd)

    if(this.TopOutletclicked === true)
    {
      this.getsalesoutletSelf()
    }
    else if(this.TopDeptclicked === true)
    {
      this.getdeptSelf();
    }
    else if(this.TopSKUclicked === true)
    {
      this.getSKUSelf();
    }
    else if(this.TopHourclicked === true)
    {
      this.gethouroutlet();
    }
  }

  clicked()
  {
    if(this.TopOutletclicked === true)
    {
      this.showall =this.toarr.slice(0,this.qtn)
      // console.log("checkslice",this.showall)
    }
    else if(this.TopDeptclicked === true)
    {
      this.showallDept =this.toarrDept.slice(0,this.qtn)
    }
    else if(this.TopSKUclicked === true)
    {
      this.showallsku =this.toarrSku.slice(0,this.qtn)
    }
  }
  
  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    var ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();

    this.monthStartConvert = this.datePipe.transform(ctrlValue, 'yyMM01');
    var monthend = ctrlValue.endOf('month');
    
    this.monthEndConvert = this.datePipe.transform(monthend, 'yyMMdd'); 

    
    if(this.TopOutletclicked === true)
    {
      this.getsalesoutletMonthly()
    }
    else if(this.TopDeptclicked === true)
    {
      this.getdeptMonthly();
    }
    else if(this.TopSKUclicked === true)
    {
      this.getSKUMonthly();
    }
    else if(this.TopHourclicked === true)
    {
      this.gethouroutletWeekly();
    }
  }

  getReportType(){
    
    this.reportType = JSON.parse(localStorage.getItem('reportList')).filter((reportRes)=>{
      return reportRes.value == 'T'
    });
    console.log(JSON.parse(localStorage.getItem('reportList')))

    if(this.reportType)
    {
      this.checkReportType = true;
    }
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
    //console.log('Received Report From Start Date : ' + this.returnDate(this.startTime) + ' End Date : ' + this.returnDate(this.endTime));
    //this.getAllreport();
    this.datehide = !this.datehide;
  }

  changeOutlet() { 
    var storepath ="";
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      //console.log(this.storeoutlet);
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
        return x.value;
      });
      var resOutlet = storepath.substring(1);
      console.log(resOutlet);
      this.outlethide =!this.outlethide;
      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'SALES' , resOutlet).then((res:any)=>{
        this.findTopOutlet(res);
        this.sumTotal(res);
        this.sumTotaltrx(res);
      })
      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'DEPARTMENT', resOutlet).then((res:any)=>{
        this.findTopdept(res);
      }) 
      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'SKU', resOutlet).then((res:any)=>{
          this.findTopsku(res);
      })
      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'HOURLY' , resOutlet).then((res:any)=>{
            this.findTopHour(res);
      })

  }

  getTodayReport()
  {
    this.getsalesoutlet();
    this.gethouroutlet();
    this.getSKU();
    this.getdept();
  }

  getdept()
  {
      let storepath = '';
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
        return x.value;
      });
      var resOutlet = storepath.substring(1);

      this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime),'DEPARTMENT', resOutlet).then((res:any)=>{
      // get daily top dept
      this.findTopdept(res);
      }) 
  }

  findTopdept(res)
  {
    //Calculate Total
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
  
    //get department Array List
    var number = null;
    let testnumber =0;
    for (var i in totals) 
    {
      const tmplar = testnumber;
      number = totals[i].Total;

      //calculate Top 1 Record
      testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar)
        {
            this.deptstore =  totals[i].Desc;
        }
         var t = (Math.round(testnumber * 100) / 100).toFixed(2);
    }

    this.largetdept = ("RM " + t.toString());
  
    //convert object to array and sort array
    this.toarrDept = Object.values(totals);
    this.toarrDept.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));

    //top10result
    this.showallDept = []
    this.showallDept = this.toarrDept;
    console.log("check",this.showallDept)
  }

  getdeptWeekly()
  {
      let [start, end] = this.getWeeklyData();
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      let storepath = '';
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
      });
      console.log("storeoutlet",this.storeoutlet)
      console.log("outlet",this.outlet)
      var resOutlet = storepath.substring(1);

      this.getReport(this.returnDate(start), this.returnDate(end),'DEPARTMENT', resOutlet).then((res:any)=>{
      // get daily top dept
      this.findTopdeptWeekly(res);
      }) 
  }

  findTopdeptWeekly(res)
  {
    //Calculate Total
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
  
    //convert object to array and sort array
    this.toarrDept = Object.values(totals);
    this.toarrDept.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));

    //top10result
    this.showallDept = []
    this.showallDept = this.toarrDept;
    //console.log("check",this.showallDept)
  }

  getdeptMonthly()
  {
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      let storepath = '';
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
      });
      var resOutlet = storepath.substring(1);

      this.getReport(this.monthStartConvert, this.monthEndConvert,'DEPARTMENT', resOutlet).then((res:any)=>{
      // get daily top dept
      this.findTopdeptWeekly(res);
      }) 
  }

  getdeptSelf()
  {
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      let storepath = '';
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
      });
      var resOutlet = storepath.substring(1);

      this.getReport(this.selfStart, this.selfEnd,'DEPARTMENT', resOutlet).then((res:any)=>{
      // get daily top dept
      this.findTopdeptWeekly(res);
      }) 
  }

  getSKU()
  {    
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
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
    //console.log(res);
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
  
    var number = null;
    let testnumber =0;
    for (var i in totals) {
      const tmplar = testnumber;
        number = totals[i].Total;
      testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar){
            this.skustore =  totals[i].Desc;
        }
         var t = (Math.round(testnumber * 100) / 100).toFixed(2);
         
      }
      //console.log("abc",t);
      this.largetsku = ("RM " + t.toString());
     //console.log(this.largetsku,this.skustore) 

     //convert to array
     this.toarrSku = Object.values(totals);
     this.toarrSku.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));
     this.showallsku = []
     this.showallsku = this.toarrSku;

  }

  getSKUWeekly()
  {    
    let [start, end] = this.getWeeklyData();
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
    return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(start), this.returnDate(end),'SKU', resOutlet).then((res:any)=>{
    // console.log(res)
    this.findTopskuWeekly(res);
    })
  }

  findTopskuWeekly(res)
  {
    //console.log(res);
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

     //convert to array
     this.toarrSku = Object.values(totals);
     this.toarrSku.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));
     this.showallsku = []
     this.showallsku = this.toarrSku;
     console.log("check",this.showallsku)
      // console.log("str",this.showtotal)
  }

  getSKUMonthly()
  {    
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
    return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.monthStartConvert, this.monthEndConvert,'SKU', resOutlet).then((res:any)=>{
    // console.log(res)
    this.findTopskuWeekly(res);
    })
  }

  getSKUSelf()
  {    
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
    return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.selfStart, this.selfEnd,'SKU', resOutlet).then((res:any)=>{
    // console.log(res)
    this.findTopskuWeekly(res);
    })
  }
  
  getsalesoutlet()
  {
    var storepath ="";
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    
    this.getReport(this.returnDate(this.startTime), this.returnDate(this.endTime), 'SALES' , resOutlet).then((res:any)=>{
      this.findTopOutlet(res);
      console.log(this.returnDate(this.startTime),this.returnDate(this.endTime))
      this.sumTotal(res);
      this.sumTotaltrx(res);
    })
  }

  findTopOutlet(res)
  {
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
  
    var number = null;
    let testnumber =0;
    for (var i in totals) {
      const tmplar = testnumber;
        number = totals[i].Total;
      testnumber = Math.max(testnumber, number);
        if(testnumber !== tmplar){
            this.store =  totals[i].Desc;
        }
         var t = (Math.round(testnumber * 100) / 100).toFixed(2);
         
      }
      // console.log("abc",totals);
      this.largest = ("RM " + t.toString());
     //console.log(this.largetsku,this.skustore) 

     //convert to array
     this.toarr = Object.values(totals);
      this.toarr.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));
     this.showall = []
     this.showall = this.toarr;
     console.log("abc",this.toarr);
  }

  getsalesoutletweekly()
  {
      let [start, end] = this.getWeeklyData();
      let storepath = '';
      console.log("check start",start)
      this.storeoutlet = this.outlet.filter((result)=>{
        return result.isCheck == true
      });
      storepath = storepath + ',' + this.storeoutlet.map(x=>{
        return x.value;
      });
      var resOutlet = storepath.substring(1);
      console.log("check return",this.returnDate(start))
      this.getReport(this.returnDate(start), this.returnDate(end), 'SALES' , resOutlet).then((res:any)=>{
        this.findTopOutletWeekly(res);
      })
  }

  findTopOutletWeekly(res)
  {
    //console.log(res);
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

     //convert to array
     this.toarr = Object.values(totals);
     this.toarr.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));

     this.showall = []
     this.showall= this.toarr;
     console.log("checkoutlet weekly",this.showall)
     
  }

  getsalesoutletMonthly()
  {
    var storepath ="";
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    console.log("montconsaleshere",this.monthStartConvert)
    console.log("montconsaleshere",this.monthEndConvert)
    this.getReport(this.monthStartConvert, this.monthEndConvert, 'SALES' , resOutlet).then((res:any)=>{
      this.findTopOutletWeekly(res);
    })
  }

  getsalesoutletSelf()
  {
    var storepath ="";
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    console.log("selfStart",this.selfStart)
    console.log("montconsaleshere",this.selfEnd)
    this.getReport(this.selfStart, this.selfEnd, 'SALES' , resOutlet).then((res:any)=>{
      this.findTopOutletWeekly(res);
    })
  }

  gethouroutlet()
  {
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
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
      this.toarrHour = Object.values(totalshour);
      this.toarrHour.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));
 
      var showalls = []
      showalls= this.toarrHour;
      //console.log("check hour",this.showall)
      //console.log("checkoutlet",this.showall)
  }

  gethouroutletWeekly()
  {
    let [start, end] = this.getWeeklyData();
    let storepath = '';
    this.storeoutlet = this.outlet.filter((result)=>{
      return result.isCheck == true
    });
    storepath = storepath + ',' + this.storeoutlet.map(x=>{
      return x.value;
    });
    var resOutlet = storepath.substring(1);
    this.getReport(this.returnDate(start), this.returnDate(end),'HOURLY' , resOutlet).then((res:any)=>{
      //console.log(res)
      this.findTopHourWeekly(res);
    })
  }

  findTopHourWeekly(res)
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

    //convert to array
    this.toarrHour = Object.values(totalshour);
     this.toarrHour.sort((a:any, b:any) => parseFloat(b.Total) - parseFloat(a.Total));

     this.showall = []
     this.showall= this.toarrHour;
     console.log("checkoutlet",this.showall)
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

  HideTopOutlet()
  {
    this.qtn=10;
    this.showall =this.toarr.slice(0,this.qtn);
    if(this.TopDeptclicked === false || this.TopHourclicked === false || this.TopSKUclicked === false)
    {
      this.TopDeptclicked = false;
      this.TopSKUclicked = false;
      this.TopOutletclicked = true;
      this.TopHourclicked = false;
    }
  }

  HideTopDept()
  {
    this.qtn=10;
    this.showallDept =this.toarrDept.slice(0,this.qtn);
    if(this.TopOutletclicked === true || this.TopHourclicked === true || this.TopSKUclicked === true)
    {
      this.TopDeptclicked = true;
      this.TopSKUclicked = false;
      this.TopOutletclicked = false;
      this.TopHourclicked = false;
    }
    console.log("dept",this.toarr)
  }

  HideTopSKU()
  {
    this.qtn=10;
    this.showallsku =this.toarrSku.slice(0,this.qtn);
    if(this.TopOutletclicked === true || this.TopDeptclicked === true || this.TopHourclicked === true)
    {
      this.TopDeptclicked = false;
      this.TopSKUclicked= true;
      this.TopOutletclicked = false;
      this.TopHourclicked = false;
    }
  }

  HideTopHour()
  {
    this.qtn=10;
    this.showallsku =this.toarrHour.slice(0,this.qtn);
    if(this.TopOutletclicked === true || this.TopDeptclicked === true || this.TopSKUclicked === true)
    {
      this.TopDeptclicked= false;
      this.TopSKUclicked = false;
      this.TopOutletclicked =false;
      this.TopHourclicked =true;
    }
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
    return this.http.post('https://qubelive.com.my/QubeSR/User/salereportAll.php', postData.toString(), httpOptions).timeout(100000).toPromise();
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

  // onButtonTitleClicked(event, item) {
  //   // event.stopPropagation();
  //   this.reportTypeSelect = item.name;
  //   console.log("reporttypename",item.name);
  //   switch (item.name) {
  //     case 'HOURLY':
  //       this.title = 'TOP HOURLY';
  //       break;
  //     case 'SKU':
  //         this.title = 'TOP SKU';
  //       break;
  //     case 'DEPARTMENT':
  //         this.title = 'TOP DEPARTMENT';
  //       break;
  //     case 'SALES':
  //         this.title = 'TOP SALES OUTLET';
  //       break;
  //   }
    
  // }

  getWeeklyData()
  {
    let now = new Date();
    let dayOfWeek = now.getDay(); //0-6
    let numDay = now.getDate();//30
    // console.log("now",now)
    // console.log("check dayof week",dayOfWeek)
    // console.log("check numday",numDay)
    let start = new Date(); //copy
    let startmonth = new Date()
    start.setDate(numDay - 6);
    start.setHours(0, 0, 0, 0);
  
    let end = new Date(new Date()); //copy
    end.setDate(numDay);
    end.setHours(0, 0, 0, 0);
    //console.log("check end date",now.getDate())
    //console.log("check end date",end)
    
    return [start,end];
  }

  checkDay()
  { 
    console.log(this.TopDeptclicked)
    if(this.TopOutletclicked == true)
    {
      this.qtn=10;
      this.showall =this.toarr.slice(0,this.qtn);
      this.getsalesoutlet();
    }
    else if(this.TopDeptclicked === true)
    {
      this.qtn=10;
      this.showallDept =this.toarrDept.slice(0,this.qtn);
      this.getdept();
    }
    else if(this.TopSKUclicked === true)
    {
      this.qtn=10;
      this.showallsku =this.toarrSku.slice(0,this.qtn);
      this.getSKU();
    }
    else if(this.TopHourclicked === true)
    {
      this.gethouroutlet();
    }
  }

  checkWeek()
  {
    if(this.TopOutletclicked === true)
    {
      this.qtn=10;
      this.showall =this.toarr.slice(0,this.qtn);
      this.getsalesoutletweekly();
    }
    else if(this.TopDeptclicked === true)
    {
      this.qtn=10;
      this.showallDept =this.toarrDept.slice(0,this.qtn);
      this.getdeptWeekly();
    }
    else if(this.TopSKUclicked === true)
    {
      this.qtn=10;
      this.showallsku =this.toarrSku.slice(0,this.qtn);
      this.getSKUWeekly();
    }
    else if(this.TopHourclicked === true)
    {
      this.gethouroutletWeekly();
    }
  }
}