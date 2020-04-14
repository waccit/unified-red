import { Component, OnInit } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-animations',
  templateUrl: './animations.component.html',
  styleUrls: ['./animations.component.scss']
})
export class AnimationsComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    'use strict';
    $(function() {
      $('.img-animate').hover(function() {
        var anim = $(this).attr('data-animation');
        $(this).addClass('animated');
        $(this).addClass(anim);
        setTimeout(function() {
          $('.img-animate').removeClass(anim);
        }, 3000);
      });
    });
  }
}
