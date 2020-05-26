import { Component, OnInit } from '@angular/core';
import { EChartOption } from 'echarts';

declare const $: any;
declare const echarts: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss']
})
export class Dashboard2Component implements OnInit {
  constructor() {}

  //Banner chart 1 start
  public bannerChartOptions1 = {
    responsive: true,
    tooltips: {
      enabled: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true
      }
    },
    scales: {
      xAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          }
        }
      ],
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }
      ]
    },
    title: {
      display: false
    }
  };
  bannerChartData1 = [
    {
      data: [28, 35, 36, 48, 46, 42, 60],
      backgroundColor: 'rgba(255,164,34,0.32)',
      borderColor: '#F4A52E',
      borderWidth: 3,
      strokeColor: '#F4A52E',
      capBezierPoints: !0,
      pointColor: '#F4A52E',
      pointBorderColor: '#F4A52E',
      pointBackgroundColor: '#F4A52E',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverBackgroundColor: '#F4A52E',
      pointHoverBorderColor: '#F4A52E',
      pointHoverRadius: 7
    }
  ];

  bannerChartLabels1 = ['2010', '2011', '2012', '2013', '2014', '2015', '2016'];

  //Banner chart 1 end

  //Banner chart 2 start
  public bannerChartOptions2 = {
    responsive: true,
    tooltips: {
      enabled: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true
      }
    },
    scales: {
      xAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          }
        }
      ],
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }
      ]
    },
    title: {
      display: false
    }
  };
  bannerChartData2 = [
    {
      data: [28, 35, 36, 48, 46, 42, 60],
      backgroundColor: 'rgba(0,175,240,0.32)',
      borderColor: '#50AAED',
      borderWidth: 3,
      strokeColor: '#50AAED',
      capBezierPoints: !0,
      pointColor: '#50AAED',
      pointBorderColor: '#50AAED',
      pointBackgroundColor: '#50AAED',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverBackgroundColor: '#50AAED',
      pointHoverBorderColor: '#50AAED',
      pointHoverRadius: 7
    }
  ];

  bannerChartLabels2 = ['2010', '2011', '2012', '2013', '2014', '2015', '2016'];

  //Banner chart 2 end

  //Banner chart 3 start
  public bannerChartOptions3 = {
    responsive: true,
    tooltips: {
      enabled: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true
      }
    },
    scales: {
      xAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          }
        }
      ],
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }
      ]
    },
    title: {
      display: false
    }
  };
  bannerChartData3 = [
    {
      data: [28, 35, 36, 48, 46, 42, 60],
      backgroundColor: 'rgba(156,39,176,0.32)',
      borderColor: '#A668FD',
      borderWidth: 3,
      strokeColor: '#A668FD',
      capBezierPoints: !0,
      pointColor: '#A668FD',
      pointBorderColor: '#A668FD',
      pointBackgroundColor: '#A668FD',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverBackgroundColor: '#A668FD',
      pointHoverBorderColor: '#A668FD',
      pointHoverRadius: 7
    }
  ];

  bannerChartLabels3 = ['2010', '2011', '2012', '2013', '2014', '2015', '2016'];

  //Banner chart 3 end

  //Banner chart 4 start
  public bannerChartOptions4 = {
    responsive: true,
    tooltips: {
      enabled: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true
      }
    },
    scales: {
      xAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          }
        }
      ],
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }
      ]
    },
    title: {
      display: false
    }
  };
  bannerChartData4 = [
    {
      data: [28, 35, 36, 48, 46, 42, 60],
      backgroundColor: 'rgba(113,216,117,0.32)',
      borderColor: '#77DC77',
      borderWidth: 3,
      strokeColor: '#77DC77',
      // capBezierPoints: !0,
      pointColor: '#77DC77',
      pointBorderColor: '#77DC77',
      pointBackgroundColor: '#77DC77',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverBackgroundColor: '#77DC77',
      pointHoverBorderColor: '#77DC77',
      pointHoverRadius: 7
    }
  ];

  bannerChartLabels4 = ['2010', '2011', '2012', '2013', '2014', '2015', '2016'];

  //Banner chart 4 end

  //Banner chart 5 start
  public bannerChartOptions5 = {
    responsive: true,
    tooltips: {
      enabled: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        usePointStyle: true
      }
    },
    scales: {
      xAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: false,
            labelString: 'Month'
          }
        }
      ],
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false,
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }
      ]
    },
    title: {
      display: false
    }
  };
  bannerChartData5 = [
    {
      data: [28, 35, 36, 48, 46, 42, 60],
      backgroundColor: 'rgba(113,216,117,0.32)',
      borderColor: '#77DC77',
      borderWidth: 3,
      strokeColor: '#77DC77',
      pointColor: '#77DC77',
      pointBorderColor: '#77DC77',
      pointBackgroundColor: '#77DC77',
      pointBorderWidth: 3,
      pointRadius: 5,
      pointHoverBackgroundColor: '#77DC77',
      pointHoverBorderColor: '#77DC77',
      pointHoverRadius: 7
    }
  ];

  bannerChartLabels5 = ['2010', '2011', '2012', '2013', '2014', '2015', '2016'];

  //Banner chart 5 end

  // line chart
  line_chart: EChartOption = {
    // height: '130px',
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Type A', 'Type B']
    },
    // calculable: true,
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['2001', '2002', '2003', '2004', '2005', '2006', '2007'],
        axisLabel: {
          color: '#bdb5b5'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#bdb5b5'
        }
      }
    ],
    series: [
      {
        name: 'sales',
        type: 'line',
        itemStyle: { color: '#54C7C7' },
        data: [11, 11, 15, 13, 12, 13, 10],
        markPoint: {
          data: [
            {
              type: 'max',
              name: '???'
            },
            {
              type: 'min',
              name: '???'
            }
          ]
        },
        markLine: {
          data: [
            {
              type: 'average'
            }
          ]
        }
      },

      {
        name: 'purchases',
        type: 'line',
        itemStyle: { color: '#B79CDC' },
        data: [1, -2, 2, 5, 3, 2, 0],
        markLine: {
          data: [
            {
              type: 'average'
            }
          ]
        }
      }
    ]
  };

  ngOnInit() {
    this.initCharts();
  }

  private initCharts() {
    $('.chart.chart-bar2').sparkline(undefined, {
      type: 'bar',
      barColor: '#54B253',
      negBarColor: '#000',
      barWidth: '5px',
      height: '67px'
    });
  }
}
