import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
  ApexStroke,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTooltip,
  ApexMarkers
} from 'ng-apexcharts';

export type circleChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive | ApexResponsive[];
};

export type radarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
};

export type areaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

declare const $: any;
declare const Chart: any;
declare const window: any;

@Component({
  selector: 'app-chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.sass']
})
export class ChartWidgetComponent implements OnInit {
  public lineChart2Options: any;
  public radarChartOptions: any;
  public circleChartOptions: any;
  public areaChartOptions: any;
  constructor() {}

  @ViewChild('chart', { static: true }) chart: ChartComponent;

  //area chart start
  public chartAreaOptions = {
    xkey: 'w',
    ykeys: ['x', 'y', 'z'],
    labels: ['X', 'Y', 'Z'],
    pointSize: 0,
    lineWidth: 0,
    resize: true,
    fillOpacity: 0.8,
    behaveLikeLine: true,
    gridLineColor: '#e0e0e0',
    hideHover: 'auto',
    lineColors: ['rgb(97, 97, 97)', 'rgb(0, 206, 209)', 'rgb(255, 117, 142)']
  };

  public chartAreaData = [
    { w: '2011 Q1', x: 2, y: 0, z: 0 },
    { w: '2011 Q2', x: 50, y: 15, z: 5 },
    { w: '2011 Q3', x: 15, y: 50, z: 23 },
    { w: '2011 Q4', x: 45, y: 12, z: 7 },
    { w: '2011 Q5', x: 20, y: 32, z: 55 },
    { w: '2011 Q6', x: 39, y: 67, z: 20 },
    { w: '2011 Q7', x: 20, y: 9, z: 5 }
  ];
  //area chart end

  public chartLineOptions = {
    xkey: 'period',
    ykeys: ['iphone', 'ipad', 'itouch'],
    labels: ['iPhone', 'iPad', 'iPod Touch'],
    pointSize: 3,
    fillOpacity: 0,
    pointStrokeColors: ['#222222', '#cccccc', '#f96332'],
    behaveLikeLine: true,
    gridLineColor: '#e0e0e0',
    lineWidth: 2,
    hideHover: 'auto',
    lineColors: ['#222222', '#20B2AA', '#f96332'],
    resize: true
  };

  public chartLineData = [
    {
      period: '2008',
      iphone: 35,
      ipad: 67,
      itouch: 15
    },
    {
      period: '2009',
      iphone: 140,
      ipad: 189,
      itouch: 67
    },
    {
      period: '2010',
      iphone: 50,
      ipad: 80,
      itouch: 22
    },
    {
      period: '2011',
      iphone: 180,
      ipad: 220,
      itouch: 76
    },
    {
      period: '2012',
      iphone: 130,
      ipad: 110,
      itouch: 82
    },
    {
      period: '2013',
      iphone: 80,
      ipad: 60,
      itouch: 85
    },
    {
      period: '2014',
      iphone: 78,
      ipad: 205,
      itouch: 135
    },
    {
      period: '2015',
      iphone: 180,
      ipad: 124,
      itouch: 140
    },
    {
      period: '2016',
      iphone: 105,
      ipad: 100,
      itouch: 85
    },
    {
      period: '2017',
      iphone: 210,
      ipad: 180,
      itouch: 120
    }
  ];

  // line chart end

  ngOnInit() {
    this.initCardChart2();
    this.initCardChart();
    this.initChartReport1();
    this.initChartReport2();
    this.linechart();
    this.pieChart();
    this.radarChart();
    this.chartArea();
  }

  private initCardChart2() {
    //Chart Bar
    $('.chart.chart-bar-2').sparkline(undefined, {
      type: 'bar',
      barColor: '#fff',
      negBarColor: '#fff',
      barWidth: '4px',
      height: '45px'
    });
    $('.chart.chart-bar2').sparkline(undefined, {
      type: 'bar',
      barColor: '#54B253',
      negBarColor: '#000',
      barWidth: '4px',
      height: '65px'
    });

    //Chart Pie
    $('.chart.chart-pie-2').sparkline(undefined, {
      type: 'pie',
      height: '45px',
      sliceColors: [
        'rgba(255,255,255,0.70)',
        'rgba(255,255,255,0.85)',
        'rgba(255,255,255,0.95)',
        'rgba(255,255,255,1)'
      ]
    });

    //Chart Line
    $('.chart.chart-line-2').sparkline(undefined, {
      type: 'line',
      width: '60px',
      height: '45px',
      lineColor: '#fff',
      lineWidth: 1.3,
      fillColor: 'rgba(0,0,0,0)',
      spotColor: 'rgba(255,255,255,0.40)',
      maxSpotColor: 'rgba(255,255,255,0.40)',
      minSpotColor: 'rgba(255,255,255,0.40)',
      spotRadius: 3,
      highlightSpotColor: '#fff'
    });
  }
  private initCardChart() {
    //Chart Bar
    $('.chart.chart-bar').sparkline(
      [6, 4, 8, 6, 8, 10, 5, 6, 7, 9, 5, 6, 4, 8, 6, 8, 10, 5, 6, 7, 9, 5],
      {
        type: 'bar',
        barColor: '#FF9800',
        negBarColor: '#fff',
        barWidth: '4px',
        height: '45px'
      }
    );

    //Chart Pie
    $('.chart.chart-pie').sparkline([30, 35, 25, 8], {
      type: 'pie',
      height: '45px',
      sliceColors: ['#65BAF2', '#F39517', '#F44586', '#6ADF42']
    });

    //Chart Line
    $('.chart.chart-line').sparkline([9, 4, 6, 5, 6, 4, 7, 3], {
      type: 'line',
      width: '60px',
      height: '45px',
      lineColor: '#65BAF2',
      lineWidth: 2,
      fillColor: 'rgba(0,0,0,0)',
      spotColor: '#F39517',
      maxSpotColor: '#F39517',
      minSpotColor: '#F39517',
      spotRadius: 3,
      highlightSpotColor: '#F44586'
    });

    // live chart
    var mrefreshinterval = 500; // update display every 500ms
    var lastmousex = -1;
    var lastmousey = -1;
    var lastmousetime;
    var mousetravel = 0;
    var mpoints = [];
    var mpoints_max = 30;
    $('html').on('mousemove', function(e) {
      var mousex = e.pageX;
      var mousey = e.pageY;
      if (lastmousex > -1) {
        mousetravel += Math.max(
          Math.abs(mousex - lastmousex),
          Math.abs(mousey - lastmousey)
        );
      }
      lastmousex = mousex;
      lastmousey = mousey;
    });
    var mdraw = function() {
      var md = new Date();
      var timenow = md.getTime();
      if (lastmousetime && lastmousetime != timenow) {
        var pps = Math.round((mousetravel / (timenow - lastmousetime)) * 1000);
        mpoints.push(pps);
        if (mpoints.length > mpoints_max) mpoints.splice(0, 1);
        mousetravel = 0;
        $('#liveChart').sparkline(mpoints, {
          width: mpoints.length * 2,
          height: '45px',
          tooltipSuffix: ' pixels per second'
        });
      }
      lastmousetime = timenow;
      setTimeout(mdraw, mrefreshinterval);
    };
    // We could use setInterval instead, but I prefer to do it this way
    setTimeout(mdraw, mrefreshinterval);
  }

  private initChartReport1() {
    var canvas = <HTMLCanvasElement>document.getElementById('chartReport1');
    // Apply multiply blend when drawing datasets
    var multiply = {
      beforeDatasetsDraw: function(chart, options, el) {
        chart.ctx.globalCompositeOperation = 'multiply';
      },
      afterDatasetsDraw: function(chart, options) {
        chart.ctx.globalCompositeOperation = 'source-over';
      }
    };

    // Gradient color - this week
    var gradientThisWeek = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientThisWeek.addColorStop(0, '#5555FF');
    gradientThisWeek.addColorStop(1, '#9787FF');

    // Gradient color - previous week
    var gradientPrevWeek = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientPrevWeek.addColorStop(0, '#FF55B8');
    gradientPrevWeek.addColorStop(1, '#FF8787');

    var config = {
      type: 'line',
      data: {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
          {
            label: 'This week',
            data: [24, 18, 16, 18, 24, 36, 28],
            backgroundColor: gradientThisWeek,
            borderColor: 'transparent',
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#FFFFFF',
            lineTension: 0.4
          },
          {
            label: 'Previous week',
            data: [20, 22, 30, 22, 18, 22, 30],
            backgroundColor: gradientPrevWeek,
            borderColor: 'transparent',
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#FFFFFF',
            lineTension: 0.4
          }
        ]
      },
      options: {
        elements: {
          point: {
            radius: 0,
            hitRadius: 5,
            hoverRadius: 5
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              display: false
            }
          ],
          yAxes: [
            {
              display: false,
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      },
      plugins: [multiply]
    };

    window.chart = new Chart(canvas, config);
  }
  private initChartReport2() {
    var canvas = <HTMLCanvasElement>document.getElementById('chartReport2');

    var gradientBlue = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientBlue.addColorStop(0, 'rgba(85, 85, 255, 0.9)');
    gradientBlue.addColorStop(1, 'rgba(151, 135, 255, 0.8)');

    var gradientHoverBlue = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientHoverBlue.addColorStop(0, 'rgba(65, 65, 255, 1)');
    gradientHoverBlue.addColorStop(1, 'rgba(131, 125, 255, 1)');

    var gradientRed = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientRed.addColorStop(0, 'rgba(255, 85, 184, 0.9)');
    gradientRed.addColorStop(1, 'rgba(255, 135, 135, 0.8)');

    var gradientHoverRed = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 150);
    gradientHoverRed.addColorStop(0, 'rgba(255, 65, 164, 1)');
    gradientHoverRed.addColorStop(1, 'rgba(255, 115, 115, 1)');

    var redArea = null;
    var blueArea = null;

    var shadowed = {
      beforeDatasetsDraw: function(chart, options) {
        chart.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        chart.ctx.shadowBlur = 40;
      },
      afterDatasetsDraw: function(chart, options) {
        chart.ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        chart.ctx.shadowBlur = 0;
      }
    };

    window.chart = new Chart(document.getElementById('chartReport2'), {
      type: 'radar',
      data: {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
          {
            label: 'Product',
            data: [25, 59, 90, 81, 60, 82, 52],
            fill: true,
            backgroundColor: gradientRed,
            borderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            pointHoverBackgroundColor: 'transparent',
            pointHoverBorderColor: 'transparent',
            pointHitRadius: 50
          },
          {
            label: 'Services',
            data: [40, 100, 40, 90, 40, 90, 84],
            fill: true,
            backgroundColor: gradientBlue,
            borderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            pointHoverBackgroundColor: 'transparent',
            pointHoverBorderColor: 'transparent',
            pointHitRadius: 50
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        gridLines: {
          display: false
        },
        scale: {
          ticks: {
            maxTicksLimit: 1,
            display: false
          }
        }
      },
      plugins: [shadowed]
    });
  }

  private linechart() {
    this.lineChart2Options = {
      chart: {
        height: 350,
        type: 'line',
        shadow: {
          enabled: false,
          color: '#bbb',
          top: 3,
          left: 2,
          blur: 3,
          opacity: 1
        }
      },
      stroke: {
        width: 7,
        curve: 'smooth'
      },
      series: [
        {
          name: 'Likes',
          data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5]
        }
      ],
      xaxis: {
        type: 'datetime',
        categories: [
          '1/11/2000',
          '2/11/2000',
          '3/11/2000',
          '4/11/2000',
          '5/11/2000',
          '6/11/2000',
          '7/11/2000',
          '8/11/2000',
          '9/11/2000',
          '10/11/2000',
          '11/11/2000',
          '12/11/2000',
          '1/11/2001',
          '2/11/2001',
          '3/11/2001',
          '4/11/2001',
          '5/11/2001',
          '6/11/2001'
        ],
        labels: {
          style: {
            colors: '#9aa0ac'
          }
        }
      },
      title: {
        text: 'Social Media',
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#666'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#FDD835'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100, 100, 100]
        }
      },
      markers: {
        size: 4,
        opacity: 0.9,
        colors: ['#FFA41B'],
        strokeColor: '#fff',
        strokeWidth: 2,

        hover: {
          size: 7
        }
      },
      yaxis: {
        min: -10,
        max: 40,
        title: {
          text: 'Engagement'
        },
        labels: {
          style: {
            color: '#9aa0ac'
          }
        }
      }
    };
  }

  private pieChart() {
    this.circleChartOptions = {
      series: [76, 67, 61, 90],
      chart: {
        height: 260,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
      labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
      legend: {
        show: true,
        floating: true,
        fontSize: '16px',
        position: 'left',
        offsetX: 50,
        offsetY: 10,
        labels: {
          useSeriesColors: true
        },
        formatter: function(seriesName, opts) {
          return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex];
        },
        itemMargin: {
          horizontal: 3
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false
            }
          }
        }
      ]
    };
  }

  private radarChart() {
    this.radarChartOptions = {
      series: [
        {
          name: 'Series Blue',
          data: [80, 50, 30, 40, 100, 20]
        },
        {
          name: 'Series Green',
          data: [20, 30, 40, 80, 20, 80]
        },
        {
          name: 'Series Orange',
          data: [44, 76, 78, 13, 43, 10]
        }
      ],
      chart: {
        height: 250,
        type: 'radar',
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1
        }
      },
      stroke: {
        width: 0
      },
      fill: {
        opacity: 0.4
      },
      markers: {
        size: 0
      },
      xaxis: {
        categories: ['2011', '2012', '2013', '2014', '2015', '2016']
      }
    };
  }

  private chartArea() {
    this.areaChartOptions = {
      chart: {
        height: 240,
        type: 'area',
        toolbar: {
          show: false
        }
      },
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      series: [
        {
          name: 'series1',
          data: [31, 40, 28, 51, 42]
        },
        {
          name: 'series2',
          data: [11, 32, 45, 32, 34]
        }
      ],

      xaxis: {
        type: 'datetime',
        categories: ['1990', '1991', '1992', '1993', '1994']
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        }
      }
    };
  }
}
