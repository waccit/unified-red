/*!
 * Credit to:
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 *
 * D3 Bar Stacker Gauge
 * Source: http://bl.ocks.org/brattonc/d54d1c9d33aa13491279#barstacker.js
 * Code has been modified to implement a TypeScript Class
 */

import { select } from 'd3-selection';
import { interpolate, interpolateRound } from 'd3-interpolate';
import { ElementRef } from '@angular/core';

export class BarStacker {
    element: HTMLElement;
    elementId: string;

    config = {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        cornerRoundingX: 20,
        cornerRoundingY: 20,
        barBoxPadding: 6,
        barPadding: 6,
        color: "#222222", // The color of the outer circle.
        vertical: true,
        textLeftTop: true,
        textPx: 20,
        barThickness: 3,
        valuePrefix: "",
        valuePostfix: "",
        valueAnimateTime: 1000
    }

    constructor(element: ElementRef) {
        this.element = element.nativeElement;
        this.elementId = this.element.id || 'BarStacker-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
    }

    loadBarStacker(label, value = 0, config = this.config) {
        if(value > config.maxValue)
            value = config.maxValue;

        if(value < config.minValue)
            value = config.minValue;

        var stacker = select(this.element);
        var stackerWidth = parseInt(stacker.style("width"));
        var stackerHeight = parseInt(stacker.style("height"));

        var barBoxX = config.vertical ? (config.textLeftTop ? config.barBoxPadding + config.textPx : config.barBoxPadding) : config.barBoxPadding;
        var barBoxY = config.vertical ? config.barBoxPadding : (config.textLeftTop ? config.barBoxPadding + config.textPx : config.barBoxPadding);
        var barBoxHeight = config.vertical ? (stackerHeight - config.barBoxPadding * 2) : (stackerHeight - config.textPx - config.barBoxPadding * 2);
        var barBoxWidth = config.vertical ?  (stackerWidth - config.textPx - config.barBoxPadding * 2) : (stackerWidth - config.barBoxPadding * 2);
        var barClipPathBoxX = barBoxX + config.barPadding;
        var barClipPathBoxY = barBoxY + config.barPadding;
        var barClipPathBoxHeight = barBoxHeight - config.barPadding * 2;
        var barClipPathBoxWidth = barBoxWidth - config.barPadding * 2;

        var textRightBottomPaddingMultiplier = 0.25;
        var textRotation = config.vertical ? -90 : 0;
        var labelTextX = config.vertical ? (config.textLeftTop ? config.textPx : stackerWidth - (config.textPx*textRightBottomPaddingMultiplier)) : config.cornerRoundingX;
        var labelTextY = config.vertical ? stackerHeight - config.cornerRoundingY : (config.textLeftTop ? config.textPx : stackerHeight - (config.textPx*textRightBottomPaddingMultiplier));
        var valueTextX = config.vertical ? (config.textLeftTop ? config.textPx : stackerWidth - (config.textPx*textRightBottomPaddingMultiplier)) : stackerWidth - config.cornerRoundingX;
        var valueTextY = config.vertical ? config.cornerRoundingY : (config.textLeftTop ? config.textPx : stackerHeight - (config.textPx*textRightBottomPaddingMultiplier));

        var defs = stacker.append("defs");
        var mask = defs.append("mask")
            .attr("id", "barboxMask_" + this.elementId);
        mask.append("rect")
            .attr("height", stackerHeight)
            .attr("width", stackerWidth)
            .attr("rx", config.cornerRoundingX)
            .attr("ry", config.cornerRoundingY)
            .style("fill", "white");
        mask.append("rect")
            .attr("x", barBoxX)
            .attr("y", barBoxY)
            .attr("rx", config.cornerRoundingX)
            .attr("ry", config.cornerRoundingY)
            .attr("height", barBoxHeight)
            .attr("width", barBoxWidth)
            .style("fill", "black");
        mask.append("text")
            .text(label)
            .attr("text-anchor", "start")
            .attr("font-size", config.textPx + "px")
            .attr("x", labelTextX)
            .attr("y", labelTextY)
            .style("fill", "black")
            .attr("transform","rotate("+textRotation+" "+labelTextX+" "+labelTextY+")");
        var valueText = mask.append("text")
            .text(config.valuePrefix + 0 + config.valuePostfix)
            .attr("V", 0)
            .attr("text-anchor", "end")
            .attr("font-size", config.textPx + "px")
            .attr("x", valueTextX)
            .attr("y", valueTextY)
            .style("fill", "black")
            .attr("transform","rotate("+textRotation+" "+valueTextX+" "+valueTextY+")");

        defs.append("clipPath")
            .attr("id", "barClipPath_" + this.elementId)
            .append("rect")
            .attr("x", barClipPathBoxX)
            .attr("y", barClipPathBoxY)
            .attr("rx", config.cornerRoundingX)
            .attr("ry", config.cornerRoundingY)
            .attr("height", barClipPathBoxHeight)
            .attr("width", barClipPathBoxWidth);

        stacker.append("rect")
            .attr("height", stackerHeight)
            .attr("width", stackerWidth)
            .attr("rx", config.cornerRoundingX)
            .attr("ry", config.cornerRoundingY)
            .style("fill", config.color)
            .attr("mask", "url(#barboxMask_" + this.elementId + ")");

        var barGroup = stacker.append("g")
            .attr("clip-path", "url(#barClipPath_" + this.elementId + ")")
            .attr("T", 0);

        var barCount = config.vertical ? barClipPathBoxHeight / (config.barThickness * 2) : barClipPathBoxWidth  / (config.barThickness * 2);
        var bars = [];

        //Draw all the bars.
        for(var i = 0; i < barCount; i++){
            if(config.vertical){
                bars[i] = barGroup.append("rect")
                    .attr("x", barClipPathBoxX)
                    .attr("y", (barClipPathBoxY + barClipPathBoxHeight - config.barThickness) - (i * config.barThickness * 2))
                    .attr("height", config.barThickness)
                    .attr("width", barClipPathBoxWidth)
                    .style("fill", config.color)
                    .style("visibility", "hidden");
            } else {
                bars[i] = barGroup.append("rect")
                    .attr("x", barClipPathBoxX + i * config.barThickness * 2)
                    .attr("y", barClipPathBoxY)
                    .attr("height", barClipPathBoxHeight)
                    .attr("width", config.barThickness)
                    .style("fill", config.color)
                    .style("visibility", "hidden");
            }
        }

        valueText.transition()
            .duration(config.valueAnimateTime)
            .tween("text", valueTextAnimator(value));

        barGroup.transition()
            .duration(config.valueAnimateTime)
            .attrTween("T", new BarTweener(value, bars).tween);

        //A tweener for revealing or hiding bars one at a time.
        // This is done instead of clipping or using a mask to prevent displaying partial bars. If a bar has a thickness
        // of 5 pixels for example, using these methods could cause only a couple pixels of the bar to display as the clip
        // or mask slides around.
        function BarTweener(value, bars){
            var _bars = bars;
            //The new maximum bar to display
            var endBar = calcBarValue(value)-1;
            var newMaxBar;
            this.tween = function(d,i,a){
                var startBar = parseInt(a[0].getAttribute("T"));
                var ascend = endBar > startBar; //Are we animating up or down...
                var barId = interpolateRound(startBar, endBar);
                return function(t) {
                    newMaxBar = barId(t); //The maximum bar to display at this point in the tween.
                    barGroup.attr("T", newMaxBar); //Keep track of the new max bar incase the animation gets interrupted.
                    if(ascend){
                        //If we're going up, find the highest bar below newMaxBar that's currently visible...
                        while(newMaxBar > 0 && _bars[newMaxBar].style("visibility") == "hidden")
                            newMaxBar--;
                        //From there going up, make all bars visible until newMaxBar.
                        for(var i = newMaxBar; i <= barId(t); i++){
                            if (i >= 0) {
                                _bars[i].style("visibility", "visible");
                            }
                        }
                    } else {
                        //If we're going down, find highest bar above newMaxBar that's currently visible...
                        while(newMaxBar < startBar && (newMaxBar < 0 ||_bars[newMaxBar].style("visibility") == "visible"))
                            newMaxBar++;
                        //From there going down, make all bars hidden until newMaxBar.
                        for(var i = newMaxBar; i > barId(t) && i >= 0; i--){
                            _bars[i].style("visibility", "hidden");
                        }
                    }

                    return endBar;
                };
            }

            this.interrupt = function(){
                //And our animation was going so well...
                barGroup.attr("T", newMaxBar);
                for(var i = newMaxBar; i < barCount; i++){
                    if (i >= 0) {
                        _bars[i].style("visibility", "hidden");
                    }
                }
            }
        }

        function calcBarValue(value){
            return Math.ceil(barCount * ((value - config.minValue) / (config.maxValue - config.minValue)));
        }

        function valueTextAnimator(value){
            return function(){
                var i = interpolate(select(this).attr("V"), value);
                return function(t) {
                    var newValue = Math.round(i(t));
                    this.textContent = config.valuePrefix + newValue + config.valuePostfix;
                    //Store the current value in V as this is easier than parsing the current value of textContent which
                    //may contain a prefix or postfix. This is needed so that, if the text tween gets interrupted, the
                    //next animation will start from whatever the current text value is.
                    select(this).attr("V", newValue);
                }
            }
        }

        function BarStackerUpdater(bars){
            var _bars = bars;
            this.update = function(value){
                if(value > config.maxValue)
                    value = config.maxValue;
                if(value < config.minValue)
                    value = config.minValue;

                var barTweener = new BarTweener(value, _bars);
                barGroup.transition()
                    .duration(config.valueAnimateTime)
                    .attrTween("T", barTweener.tween)
                    .on("interrupt", barTweener.interrupt);

                valueText.transition()
                    .duration(config.valueAnimateTime)
                    .tween("text", valueTextAnimator(value));
            }
        }

        return new BarStackerUpdater(bars);
    }
}