import { Component, OnInit, ViewChild } from '@angular/core';

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
  ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any; // ApexTooltip;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

declare const $: any;

@Component({
  selector: 'app-dashboard3',
  templateUrl: './dashboard3.component.html',
  styleUrls: ['./dashboard3.component.scss']
})
export class Dashboard3Component implements OnInit {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Angular',
          data: [45, 52, 38, 24, 33, 26, 21]
        },
        {
          name: 'Wordpress',
          data: [35, 41, 62, 42, 13, 18, 29]
        },
        {
          name: 'Java',
          data: [87, 57, 74, 99, 75, 38, 62]
        }
      ],
      chart: {
        height: 300,
        type: 'line'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 5,
        curve: 'straight',
        dashArray: [0, 8, 5]
      },

      legend: {
        tooltipHoverFormatter: function(val, opts) {
          return (
            val +
            ' - <strong>' +
            opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
            '</strong>'
          );
        }
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        labels: {
          trim: false
        },
        categories: ['2010', '2011', '2012', '2013', '2014', '2015', '2016']
      },
      tooltip: {
        y: [
          {
            title: {
              formatter: function(val) {
                return val + ' (mins)';
              }
            }
          },
          {
            title: {
              formatter: function(val) {
                return val + ' per session';
              }
            }
          },
          {
            title: {
              formatter: function(val) {
                return val;
              }
            }
          }
        ]
      },
      grid: {
        borderColor: '#f1f1f1'
      }
    };
  }

  // Line chert start
  public lineChartOptions = {
    responsive: !0,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            fontColor: '#bdb5b5'
          }
        }
      ],
      yAxes: [
        {
          display: true,
          ticks: {
            padding: 10,
            stepSize: 25,
            max: 100,
            min: 0,
            fontColor: '#bdb5b5'
          },
          gridLines: {
            display: true,
            draw1Border: !1,
            lineWidth: 0.5,
            zeroLineColor: 'transparent',
            drawBorder: false
          }
        }
      ]
    }
  };
  lineChartData = [
    {
      data: [20, 60, 25, 75, 90, 40, 43],
      borderWidth: 3,
      borderColor: '#D07BED',
      pointBackgroundColor: '#D07BED',
      pointBorderColor: '#D07BED',
      pointHoverBackgroundColor: '#FFF',
      pointHoverBorderColor: '#D07BED',
      pointRadius: 5,
      pointHoverRadius: 6,
      fill: !1
    },
    {
      data: [25, 20, 70, 58, 35, 80, 80],
      borderWidth: 3,
      borderColor: '#51CCA9',
      pointBackgroundColor: '#51CCA9',
      pointBorderColor: '#51CCA9',
      pointHoverBackgroundColor: '#FFF',
      pointHoverBorderColor: '#51CCA9',
      pointRadius: 5,
      pointHoverRadius: 6,
      fill: !1
    }
  ];

  lineChartLabels = ['2001', '2002', '2003', '2004', '2005', '2006', '2007'];

  // Line chert end

  ngOnInit() {
    $(document).on(
      'click',
      '.to-do-list .form-check-label .form-check-input',
      function() {
        $(this)
          .parent('label')
          .toggleClass('line-through');
      }
    );
    $(document).on('click', '.todo-remove', function() {
      $(this)
        .closest('li')
        .remove();
      return false;
    });

    $(document).on('click', '.panel .tools .fa-times', function() {
      $(this)
        .parents('.panel')
        .parent()
        .remove();
    });

    //todo
    $('.tdl-new').on('keypress', function(e) {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        var v = $(this).val();
        var s = v.replace(/ +?/g, '');
        if (s == '') {
          return false;
        } else {
          $('.tdl-content ul').append(
            "<li class='clearfix'> <div class='form-check m-l-10'> <label class='form-check-label'> <input class='form-check-input' type='checkbox' value=''>" +
              v +
              "<span class='form-check-sign'> <span class='check'></span> </span> </label> </div> <div class='todo-actionlist pull-right clearfix'> <a href='#' class=''> <i class='material-icons'>clear</i> </a> </div> </li>"
          );
          $(this).val('');
        }
      }
    });

    // for dynamically created a tags
    $('.tdl-content').on('click', 'a', function() {
      var _li = $(this)
        .parent()
        .parent('li');
      _li
        .addClass('remove')
        .stop()
        .delay(100)
        .slideUp('fast', function() {
          _li.remove();
        });
      return false;
    });
  }
}
