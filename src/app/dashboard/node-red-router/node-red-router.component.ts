import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services';

@Component({
  selector: 'app-node-red-router',
  templateUrl: './node-red-router.component.html',
  styleUrls: ['./node-red-router.component.sass']
})
export class NodeREDRouterComponent implements OnInit {

  constructor(
    private menuService: MenuService
  ) { }

  showNavigateBtn: boolean = true;

  ngOnInit(): void {
    this.menuService.menu.subscribe(menu => {
      if (menu.length) 
        this.showNavigateBtn = false;
      else 
        this.showNavigateBtn = true;
    });
  }

  navigateToNodeRED() {
    let hostname = window.location.hostname;
    let port = window.location.port;
    window.open(`http://${hostname}:${port}/admin`, '_blank');
}

}
