import { Component, OnInit } from '@angular/core';
import { EChartOption } from 'echarts';

@Component({
  selector: 'app-echart',
  templateUrl: './echart.component.html',
  styleUrls: ['./echart.component.scss']
})
export class EchartComponent {
  // line bar chart
  line_bar_chart: EChartOption = {
    grid: {
      top: '6',
      right: '0',
      bottom: '17',
      left: '25'
    },
    xAxis: {
      data: ['2014', '2015', '2016', '2017', '2018'],
      axisLine: {
        lineStyle: {
          color: '#eaeaea'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    tooltip: {
      show: true,
      showContent: true,
      alwaysShowContent: false,
      triggerOn: 'mousemove',
      trigger: 'axis'
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          color: '#eaeaea'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#eaeaea'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    series: [
      {
        name: 'sales',
        type: 'bar',
        data: [11, 14, 8, 16, 11, 13]
      },
      {
        name: 'profit',
        type: 'line',
        smooth: true,
        data: [10, 7, 17, 11, 15],
        symbolSize: 10
      },
      {
        name: 'growth',
        type: 'bar',
        data: [10, 14, 10, 15, 9, 25]
      }
    ],
    color: ['#9f78ff', '#fa626b', '#32cafe']
  };

  // line chart
  line_chart: EChartOption = {
    grid: {
      top: '6',
      right: '0',
      bottom: '17',
      left: '25'
    },
    xAxis: {
      data: ['2014', '2015', '2016', '2017', '2018'],
      axisLine: {
        lineStyle: {
          color: '#eaeaea'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    tooltip: {
      show: true,
      showContent: true,
      alwaysShowContent: false,
      triggerOn: 'mousemove',
      trigger: 'axis'
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          color: 'none'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#eaeaea'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    series: [
      {
        name: 'sales',
        type: 'line',
        smooth: true,
        data: [15, 22, 14, 31, 17, 41],
        symbolSize: 10
        // color: ["#FF8D60"]
      },
      {
        name: 'Profit',
        type: 'line',
        smooth: true,
        symbolSize: 10,
        // size: 10,
        data: [8, 12, 28, 10, 10, 12]
        // color: ["#009DA0"]
      }
    ]
  };

  // bar chart
  bar_chart: EChartOption = {
    grid: {
      top: '6',
      right: '0',
      bottom: '17',
      left: '25'
    },
    xAxis: {
      data: ['2014', '2015', '2016', '2017', '2018'],

      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    tooltip: {
      show: true,
      showContent: true,
      alwaysShowContent: false,
      triggerOn: 'mousemove',
      trigger: 'axis'
    },
    yAxis: {
      axisLabel: {
        fontSize: 10,
        color: '#9aa0ac'
      }
    },
    series: [
      {
        name: 'sales',
        type: 'bar',
        data: [13, 14, 10, 16, 11, 13]
      },

      {
        name: 'growth',
        type: 'bar',
        data: [10, 14, 10, 15, 9, 25]
      }
    ],
    color: ['#9f78ff', '#32cafe']
  };

  // graph line chart
  graph_line_chart: EChartOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['sales', 'purchases']
    },
    toolbox: {
      show: !1
    },
    xAxis: [
      {
        type: 'category',
        data: ['2000', '2001', '2002', '2003', '2004', '2005'],
        axisLabel: {
          fontSize: 10,
          color: '#9aa0ac'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#9aa0ac'
        }
      }
    ],
    series: [
      {
        name: 'sales',
        type: 'bar',
        data: [22, 54, 37, 23, 25.6, 76],
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
        type: 'bar',
        data: [35, 45, 47, 10, 35, 70],
        markLine: {
          data: [
            {
              type: 'average'
            }
          ]
        }
      }
    ],
    color: ['#9f78ff', '#32cafe']
  };

  /* Pie Chart */
  pie_chart: EChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      data: [
        'Direct Access',
        'E-mail Marketing',
        'Union Ad',
        'Video Ads',
        'Search Engine'
      ]
    },

    series: [
      {
        name: 'Chart Data',
        type: 'pie',
        radius: '55%',
        center: ['50%', '48%'],
        data: [
          {
            value: 335,
            name: 'Direct Access'
          },
          {
            value: 310,
            name: 'E-mail Marketing'
          },
          {
            value: 234,
            name: 'Union Ad'
          },
          {
            value: 135,
            name: 'Video Ads'
          },
          {
            value: 548,
            name: 'Search Engine'
          }
        ]
      }
    ],
    color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8']
  };

  // area line chart
  area_line_chart: EChartOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Intent', 'Pre-order', 'Deal']
    },
    toolbox: {
      show: !0,
      feature: {
        magicType: {
          show: !0,
          title: {
            line: 'Line',
            bar: 'Bar',
            stack: 'Stack',
            tiled: 'Tiled'
          },
          type: ['line', 'bar', 'stack', 'tiled']
        },
        restore: {
          show: !0,
          title: 'Restore'
        },
        saveAsImage: {
          show: !0,
          title: 'Save Image'
        }
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: !1,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLabel: {
          fontSize: 10,
          color: '#9aa0ac'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#9aa0ac'
        }
      }
    ],
    series: [
      {
        name: 'Deal',
        type: 'line',
        smooth: !0,
        itemStyle: {
          normal: {
            areaStyle: {
              type: 'default'
            }
          }
        },
        data: [10, 12, 21, 54, 260, 830, 710]
      },
      {
        name: 'Pre-order',
        type: 'line',
        smooth: !0,
        itemStyle: {
          normal: {
            areaStyle: {
              type: 'default'
            }
          }
        },
        data: [30, 182, 434, 791, 390, 30, 10]
      },
      {
        name: 'Intent',
        type: 'line',
        smooth: !0,
        itemStyle: {
          normal: {
            areaStyle: {
              type: 'default'
            }
          }
        },
        data: [1320, 1132, 601, 234, 120, 90, 20]
      }
    ],
    color: ['#9f78ff', '#fa626b', '#32cafe']
  };

  // sonar chart
  sonar_chart: EChartOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      data: ['Allocated Budget', 'Actual Spending']
    },
    toolbox: {
      show: !0,
      feature: {
        restore: {
          show: !0,
          title: 'Restore'
        },
        saveAsImage: {
          show: !0,
          title: 'Save Image'
        }
      }
    },
    polar: [
      {
        indicator: [
          {
            text: 'Sales',
            max: 6e3
          },
          {
            text: 'Administration',
            max: 16e3
          },
          {
            text: 'Information Techology',
            max: 3e4
          },
          {
            text: 'Customer Support',
            max: 38e3
          },
          {
            text: 'Development',
            max: 52e3
          },
          {
            text: 'Marketing',
            max: 25e3
          }
        ]
      }
    ],
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: [4300, 1e4, 28e3, 35e3, 5e4, 19e3],
            name: 'Allocated Budget'
          },
          {
            value: [5e3, 14e3, 28e3, 31e3, 42e3, 21e3],
            name: 'Actual Spending'
          }
        ]
      }
    ]
  };

  //donut chart
  donut_chart: EChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      data: [
        'Direct Access',
        'E-mail Marketing',
        'Union Ad',
        'Video Ads',
        'Search Engine'
      ]
    },
    toolbox: {
      show: !0,
      feature: {
        magicType: {
          show: !0,
          type: ['pie', 'funnel'],
          option: {
            funnel: {
              x: '25%',
              width: '50%',
              funnelAlign: 'center',
              max: 1548
            }
          }
        },
        restore: {
          show: !0,
          title: 'Restore'
        },
        saveAsImage: {
          show: !0,
          title: 'Save Image'
        }
      }
    },
    series: [
      {
        name: 'Access to the resource',
        type: 'pie',
        radius: ['35%', '55%'],
        itemStyle: {
          normal: {
            label: {
              show: !0
            },
            labelLine: {
              show: !0
            }
          },
          emphasis: {
            label: {
              show: !0,
              position: 'center',
              textStyle: {
                fontSize: '14',
                fontWeight: 'normal'
              }
            }
          }
        },
        data: [
          {
            value: 335,
            name: 'Direct Access'
          },
          {
            value: 310,
            name: 'E-mail Marketing'
          },
          {
            value: 234,
            name: 'Union Ad'
          },
          {
            value: 135,
            name: 'Video Ads'
          },
          {
            value: 1548,
            name: 'Search Engine'
          }
        ]
      }
    ]
  };
  constructor() {}
}
