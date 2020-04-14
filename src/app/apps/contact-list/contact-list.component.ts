import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface PeriodicElement {
  checked: boolean;
  imageUrl: string;
  name: string;
  phoneNo: string;
  address: string;
  action: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    checked: false,
    imageUrl: 'assets/images/user/user1.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user2.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user3.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user4.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user5.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user6.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user7.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user8.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user9.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user10.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user1.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user2.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user3.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user4.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user5.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user6.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user7.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  },
  {
    checked: false,
    imageUrl: 'assets/images/user/user8.jpg',
    name: 'Tim Hank',
    phoneNo: '123456789',
    address: '70 Bowman St. South Windsor, CT 06074',
    action: ''
  }
];

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  displayedColumns: string[] = [
    'checked',
    'imageUrl',
    'name',
    'phoneNo',
    'address',
    'action'
  ];

  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }
}
