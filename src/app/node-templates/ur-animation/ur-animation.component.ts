import { Component } from '@angular/core';
import { UrTemplateComponent } from '../ur-template/ur-template.component';

declare var $: any;

@Component({
    selector: 'app-ur-animation',
    templateUrl: './ur-animation.component.html',
    styleUrls: ['./ur-animation.component.sass'],
})
export class UrAnimationComponent extends UrTemplateComponent {
    private expressionGlobals = `
    function interpolate(value, minIn, maxIn, minOut, maxOut) {
        let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
        return Math.max(minOut, Math.min(maxOut, out));
    }
    `;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        if (!this.data || !this.data.format) {
            this.container.html('No animation code found');
            return;
        }
        this.processImages();
    }

    private processImages() {
        /*
        Example DOM:
        <img src="/img/VAV/hwreheat/background.jpg">
        <img animated name="damper" src="/img/VAV/hwreheat/damper1.jpg" style="position: absolute;">
        <img animated name="coil" src="/img/VAV/hwreheat/coil10.jpg" style="position: absolute;"
        */
        this.container.ready(() => { // ensure container has loaded
            // setTimeout used to stall so that container width can be properly calculated.
            // https://stackoverflow.com/questions/6132141/jquery-why-does-width-sometimes-return-0-after-inserting-elements-with-html
            setTimeout(() => {
                let containerHeight = this.container.height();
                let containerWidth = this.container.width();
                this.container.find("[animated]").each(function() {
                    let anime = $(this);
                    let position = anime.position();
                    let top = 100 * position.top / containerHeight;
                    let left = 100 * position.left / containerWidth;
                    anime.css({ 'position':'absolute', 'top': top+'%', 'left': left+'%' });
                    if (anime.is("img")) {
                        let width = anime.width();
                        let widthPerc = 100 * width / containerWidth;
                        anime.css({ 'width': widthPerc+'%', 'max-width': width+'px' });
                    }
                });
            }, 100);    
        });
    }

    updateValue(data:any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            this.processRule(data.msg);
        }
    }
    private processRule(msg:any) {
        for (let i = 0; i < this.data.rules.length; i++) {
            let rule:AnimationRule = this.data.rules[i];
            if (rule.topic === msg.topic) {
                let element = this.container.find(`[animated][name='${rule.img}']`);
                if (element.length) {
                    let result;
                    switch (rule.prop) {
                        case 'vis': result = this.vis(element, rule.exp, msg.payload); break;
                        case 'src': result = this.src(element, rule.exp, msg.payload); break;
                        case 'sub': result = this.sub(element, rule.exp, msg.payload); break;
                    }
                }
            }
        }
    }

    private evaluate(exp:any, value?:any) {
        try {
            if (typeof value !== 'undefined') {
                exp = exp.replace(/\{x\}/g, value);
            }
            return eval(exp+ '; ' + this.expressionGlobals);    
        } catch (error) {
            console.log("Animation evaluate error:", error);
        }
    }

    private vis(element, exp, payload?) {
        // Example expressions:
        // {x} > 0
        // {x} === "On"
        let result = this.evaluate(exp, payload);
        if (result) {
            element.show();
        }
        else {
            element.hide();
        }
        return result;
    }

    private src(element, exp, payload) {
        if (!element.is("img")) {
            console.log('Animation failed to process source rule because element is not an image (img)', element);
            return;
        }
        // Example expressions:
        // {x} > 0 ? "valve_open.png" : "valve_closed.png"
        // if ({x} === "On") { return "fan_on.gif"; } else { return "fan_off.gif" }
        let result = this.evaluate(exp, payload);
        element.attr("src", result);
        return result;
    }

    private sub(element, exp, payload) {
        if (!element.is("img")) {
            console.log('Animation failed to process source substitution rule because element is not an image (img)', element);
            return;
        }
        let src = element.attr("src");
        if (!src) {
            console.log('Animation failed to process source substitution rule because the src attribute is not set', element);
            return;
        }
        // Regular expression to find numbers before a file extension:
        // (.*?)([\d]+)(\..+)$
        //   ^     ^     ^
        //   |     |     Followed by a period and one or more characters that terminate the string
        //         Followed by one or more digits
        //   Find the fewest number of characters (lazy / ungreedy)
        let srcParts = /(.*?)([\d]+)(\..+)$/i.exec(src);
        if (srcParts.length !== 4) {
            console.log('Animation failed to substitute image src property because the src attribute did not match the expected file path pattern:\n'+
            '    Any file path that ends in one or more digits before the file extension:\n'+
            '        any.thing/you_want0000.png\n', srcParts);
        }
        // Example expressions:
        // {x}
        // parseInt({x} / 10)
        // parseInt(1 + {x} / (100 / 9))
        // Math.round({x} / 10)
        // parseInt( interpolate({x}, 0, 100, 1, 10) )
        let result = this.evaluate(exp, payload);
        let newSrc = srcParts[1] + result + srcParts[3];
        element.attr("src", newSrc);
        return newSrc;
    }
}

interface AnimationRule {
    img: string;
    topic: string;
    prop: string;
    exp: string;
}