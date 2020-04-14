import { Component, OnInit } from '@angular/core';

declare const Chart: any;

@Component({
  selector: 'app-chartjs',
  templateUrl: './chartjs.component.html',
  styleUrls: ['./chartjs.component.scss']
})
export class ChartjsComponent {
  constructor() {}

  // Line chert start
  public lineChartOptions = {
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
  lineChartData = [
    {
      label: 'Foods',
      data: [0, 30, 10, 120, 50, 63, 10],
      backgroundColor: 'transparent',
      borderColor: '#222222',
      borderWidth: 2,
      pointStyle: 'circle',
      pointRadius: 3,
      pointBorderColor: 'transparent',
      pointBackgroundColor: '#222222'
    },
    {
      label: 'Electronics',
      data: [0, 50, 40, 80, 40, 79, 120],
      backgroundColor: 'transparent',
      borderColor: '#f96332',
      borderWidth: 2,
      pointStyle: 'circle',
      pointRadius: 3,
      pointBorderColor: 'transparent',
      pointBackgroundColor: '#f96332'
    }
  ];

  lineChartLabels = ['January', 'February', 'Mars', 'April'];

  // Line chert end

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

  // start radar chart
  public radarChartLabels: string[] = [
    'A1',
    'A2',
    'A3',
    'A4',
    'A5',
    'A6',
    'A7'
  ];

  public radarChartData: any = [
    { data: [58, 60, 74, 78, 55, 64, 42], label: 'Series A' },
    { data: [30, 45, 51, 22, 79, 35, 82], label: 'Series B' }
  ];
  public radarChartType = 'radar';
  public radarChartColors: any[] = [
    {
      backgroundColor: ['rgba(109, 144, 232,0.8)']
    },
    {
      backgroundColor: ['rgba(255, 140, 96,0.8)']
    }
  ];
  public radarChartOptions: any = {
    animation: false,
    responsive: true,
    scale: {
      ticks: {
        beginAtZero: true,
        fontFamily: 'Poppins',
        fontColor: '#9aa0ac' // Font Color
      }
    }
  };
  // end radar chart

  // Doughnut chart start
  public doughnutChartLabels: string[] = [
    'Project 1',
    'Project 2',
    'Project 3',
    'Project 4'
  ];
  public doughnutChartData: number[] = [45, 25, 20, 10];
  public doughnutChartColors: any[] = [
    {
      backgroundColor: ['#735A84', '#E76412', '#9BC311', '#4E98D9']
    }
  ];

  public doughnutChartType = 'doughnut';
  public doughnutChartOptions: any = {
    animation: false,
    responsive: true
  };

  // Doughnut chart end

  //scatter chart start
  public scatterChartData: Array<any> = [
    {
      data: [
        {
          x: 10,
          y: 80
        },
        {
          x: 20,
          y: 76
        },
        {
          x: 30,
          y: 69
        },
        {
          x: 40,
          y: 61
        },
        {
          x: 50,
          y: 55
        },
        {
          x: 60,
          y: 51
        },
        {
          x: 70,
          y: 48
        },
        {
          x: 80,
          y: 45
        }
      ],
      label: 'project 1'
    }
  ];
  public scatterChartLabels: Array<any> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July'
  ];
  public scatterChartOptions: any = {
    responsive: true,
    scales: {
      xAxes: [
        {
          position: 'bottom',
          gridLines: {
            zeroLineColor: 'rgba(0,0,0,.1)',
            drawTicks: false
          },
          scaleLabel: {
            labelString: 'x axis',
            display: true
          },
          ticks: {
            fontColor: '#9aa0ac' // Font Color
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: '#9aa0ac' // Font Color
          },
          gridLines: {
            zeroLineColor: 'rgba(81,117,224,1)',
            drawTicks: false
          },
          scaleLabel: {
            labelString: 'y axis',
            display: true
          }
        }
      ]
    }
  };
  public scatterChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(78,114,214,.6)',
      borderColor: 'transparent',
      pointBorderColor: '#5176E1',
      pointBackgroundColor: '#FFF',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 2,
      pointRadius: 4
    }
  ];
  public scatterChartLegend = true;
  public scatterChartType = 'scatter';
  //scatter chart end

  // pie chart start
  public pieChartLabels: string[] = [
    'Project 1',
    'Project 2',
    'Project 3',
    'Project 4'
  ];
  public pieChartData: number[] = [45, 25, 20, 10];
  public pieChartType = 'pie';
  public pieChartColors: any[] = [
    {
      backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811', '#5BCFA5']
    }
  ];
  public pieChartOptions: any = {
    animation: false,
    responsive: true
  };
  // pie chart end

  // Polar chart start
  public polarAreaChartLabels: string[] = [
    'Project 1',
    'Project 2',
    'Project 3',
    'Project 4'
  ];
  public polarAreaChartData: number[] = [15, 18, 9, 19];
  public polarAreaLegend = true;
  public ploarChartColors: any[] = [
    {
      backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811', '#5BCFA5']
    }
  ];

  public polarAreaChartType = 'polarArea';
  public polarChartOptions: any = {
    animation: false,
    responsive: true
  };
  // Polar chart start
}
