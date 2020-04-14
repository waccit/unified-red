import { Component, OnInit } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss']
})
export class DragDropComponent {
  BAG = 'DRAGULA_EVENTS';
  subs = new Subscription();

  constructor(private dragulaService: DragulaService) {
    this.dragulaService.createGroup('VAMPIRES', {
      // ...
    });

    this.dragulaService.dropModel('VAMPIRES').subscribe(args => {
      console.log(args);
    });

    this.subs.add(
      dragulaService.drag(this.BAG).subscribe(({ el }) => {
        this.removeClass(el, 'ex-moved');
      })
    );
    this.subs.add(
      dragulaService.drop(this.BAG).subscribe(({ el }) => {
        this.addClass(el, 'ex-moved');
      })
    );
    this.subs.add(
      dragulaService.over(this.BAG).subscribe(({ el, container }) => {
        console.log('over', container);
        this.addClass(container, 'ex-over');
      })
    );
    this.subs.add(
      dragulaService.out(this.BAG).subscribe(({ el, container }) => {
        console.log('out', container);
        this.removeClass(container, 'ex-over');
      })
    );

    //spill
    dragulaService.createGroup('SPILL', {
      removeOnSpill: true
    });

    //revert
    dragulaService.createGroup('REVERT', {
      revertOnSpill: true
    });

    dragulaService.createGroup('COPYABLE', {
      copy: (el, source) => {
        return source.id === 'left';
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'left';
      }
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private hasClass(el: Element, name: string): any {
    return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
  }

  private addClass(el: Element, name: string): void {
    if (!this.hasClass(el, name)) {
      el.className = el.className ? [el.className, name].join(' ') : name;
    }
  }

  private removeClass(el: Element, name: string): void {
    if (this.hasClass(el, name)) {
      el.className = el.className.replace(
        new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)', 'g'),
        ''
      );
    }
  }
}
