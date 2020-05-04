import { Component, ViewChild, OnInit } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

import { SocketIoService } from './../../services/socket-io.service';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexFill,
  ApexLegend
} from 'ng-apexcharts';

var d = new Date(),
  date = d.getDate(),
  month = d.getMonth(),
  year = d.getFullYear();

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

export type ChartOptions2 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild('calendar', { static: false })
  calendarComponent: FullCalendarComponent; // the #calendar in the template

  @ViewChild('chart', { static: false }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions2>;

  calendarVisible = true;
  calendarPlugins = [dayGridPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput[] = [
    {
      title: 'Conference',
      start: new Date(year, month, date - 5, 0, 0),
      end: new Date(year, month, date - 2, 0, 0),
      backgroundColor: '#00FFFF'
    },
    {
      title: 'Holiday',
      start: new Date(year, month, date - 10, 9, 0),
      end: new Date(year, month, date - 8, 0, 0),
      backgroundColor: '#F3565D'
    },
    {
      title: 'Repeating Event',
      start: new Date(year, month, date + 5, 16, 0),
      allDay: !1,
      backgroundColor: '#1bbc9b'
    },
    {
      title: 'Meeting',
      start: new Date(year, month, date, 10, 30),
      allDay: !1
    },
    {
      title: 'Result Day',
      start: new Date(year, month, date + 7, 19, 0),
      end: new Date(year, month, date + 1, 22, 30),
      backgroundColor: '#DC35A9',
      allDay: !1
    },
    {
      title: 'Click for Google',
      start: new Date(year, month, 29),
      end: new Date(year, month, 30),
      backgroundColor: '#9b59b6',
      url: 'http://google.com/'
    }
  ];

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private socketIo: SocketIoService) {}

  // area chart start
  public areaChartOptions = {
    responsive: true,
    tooltips: {
      mode: 'index',
      titleFontSize: 12,
      titleFontColor: '#000',
      bodyFontColor: '#000',
      backgroundColor: '#fff',
      titleFontFamily: 'Poppins',
      bodyFontFamily: 'Poppins',
      cornerRadius: 3,
      intersect: false
    },
    legend: {
      display: false,
      labels: {
        usePointStyle: true,
        fontFamily: 'Poppins'
      }
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          },
          ticks: {
            fontFamily: 'Poppins',
            fontColor: '#9aa0ac' // Font Color
          }
        }
      ],
      yAxes: [
        {
          display: true,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value',
            fontFamily: 'Poppins'
          },
          ticks: {
            fontFamily: 'Poppins',
            fontColor: '#9aa0ac' // Font Color
          }
        }
      ]
    },
    title: {
      display: false,
      text: 'Normal Legend'
    }
  };
  areaChartData = [
    {
      label: 'Foods',
      data: [0, 105, 190, 140, 270],
      borderWidth: 2,
      pointStyle: 'circle',
      pointRadius: 3,
      pointBorderColor: 'transparent'
    },
    {
      label: 'Electronics',
      data: [0, 152, 80, 250, 190],
      borderWidth: 2,
      pointStyle: 'circle',
      pointRadius: 3,
      pointBorderColor: 'transparent'
    }
  ];

  areaChartLabels = ['January', 'February', 'March', 'April', 'May'];
  // area chart end

  // barChart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      xAxes: [
        {
          ticks: {
            fontFamily: 'Poppins',
            fontColor: '#9aa0ac' // Font Color
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            fontFamily: 'Poppins',
            fontColor: '#9aa0ac' // Font Color
          }
        }
      ]
    }
  };
  public barChartLabels: string[] = [
    '2001',
    '2002',
    '2003',
    '2004',
    '2005',
    '2006',
    '2007'
  ];
  public barChartType = 'bar';
  public barChartLegend = true;

  public barChartData: any[] = [
    { data: [58, 60, 74, 78, 55, 64, 42], label: 'Series A' },
    { data: [30, 45, 51, 22, 79, 35, 82], label: 'Series B' }
  ];

  public barChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(109, 144, 232, 0.8)',
      borderColor: 'rgba(109, 144, 232,1)',
      pointBackgroundColor: 'rgba(109, 144, 232,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(109, 144, 232,0.8)'
    },
    {
      backgroundColor: 'rgba(255, 140, 96, 0.8)',
      borderColor: 'rgba(255, 140, 96,1)',
      pointBackgroundColor: 'rgba(255, 140, 96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 140, 96,0.8)'
    }
  ];
  // end bar chart

  //Node-RED DEMO UI-TEXT
  ui_text = "default";

  ngOnInit() {
    'use strict';
    
    //socketio testing
    // this.socketIo.connect(function (ui) {
    //   console.log(ui.site);
    //   console.log(ui.menu);
    // }, function () {});

    // // this.socketIo.on('ui-controls', (data) => {
    // //   console.log("ui-controls data received: ", data);
    // // })

    // this.socketIo.on('update-value', data => {
    //   console.log('update-value called!: ', data);
    //   this.ui_text = data.value;
    // });

    this.chart1();
    this.chart2();
  }

  // Chart 1
  private chart1() {
    this.chartOptions = {
      series: [
        {
          name: 'High - 2013',
          data: [28, 29, 33, 36, 32, 32, 33]
        },
        {
          name: 'Low - 2013',
          data: [12, 11, 14, 18, 17, 13, 13]
        }
      ],
      chart: {
        height: 250,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#FF3D00', '#43A047'],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'smooth'
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        labels: {
          style: {
            colors: '#9aa0ac'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Temperature'
        },
        min: 5,
        max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };
  }

  // Chart 2
  private chart2() {
    this.chartOptions2 = {
      series: [
        {
          name: 'blue',
          data: [
            {
              x: 'Team A',
              y: [1, 5]
            },
            {
              x: 'Team B',
              y: [4, 6]
            },
            {
              x: 'Team C',
              y: [5, 8]
            }
          ]
        },
        {
          name: 'green',
          data: [
            {
              x: 'Team A',
              y: [2, 6]
            },
            {
              x: 'Team B',
              y: [1, 3]
            },
            {
              x: 'Team C',
              y: [7, 8]
            }
          ]
        }
      ],
      chart: {
        type: 'rangeBar',
        height: 250
      },
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      dataLabels: {
        enabled: true
      }
    };
  }
}
