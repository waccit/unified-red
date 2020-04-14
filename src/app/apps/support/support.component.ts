import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface PeriodicElement {
  checked: boolean;
  imageUrl: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  assignTo: string;
  date: string;
  action: string;
}

declare const $: any;

const ELEMENT_DATA: PeriodicElement[] = [
  {
    checked: false,
    imageUrl: 'assets/images/user/user1.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user2.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user3.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'open',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user4.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user5.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'open',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user6.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user7.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'open',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user8.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'pending',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user9.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user10.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user1.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'open',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user2.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user3.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'pending',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user4.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user5.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user6.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'pending',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user7.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user8.jpg',
    name: 'Tim Hank',
    email: 'test@example.com',
    subject: 'Image not Proper',
    status: 'closed',
    assignTo: 'John Deo',
    date: '27/05/2016',
    action: ''
  }
];

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  displayedColumns: string[] = [
    'checked',
    'imageUrl',
    'name',
    'email',
    'subject',
    'status',
    'assignTo',
    'date',
    'action'
  ];

  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    $('.chart.chart-bar').sparkline(undefined, {
      type: 'bar',
      barColor: '#fff',
      negBarColor: '#fff',
      barWidth: '4px',
      height: '45px'
    });

    //Chart Pie
    $('.chart.chart-pie').sparkline(undefined, {
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
    $('.chart.chart-line').sparkline(undefined, {
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
}
