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
        <img static src="/img/VAV/hwreheat/background.jpg">
        <img animated name="damper" src="/img/VAV/hwreheat/damper1.jpg" style="position: absolute;">
        <img animated name="coil" src="/img/VAV/hwreheat/coil10.jpg" style="position: absolute;"
        */
        this.container.ready(() => { // ensure container has loaded
            // setTimeout used to stall so that container width can be properly calculated.
            // https://stackoverflow.com/questions/6132141/jquery-why-does-width-sometimes-return-0-after-inserting-elements-with-html
            setTimeout(() => {
                let staticElement = this.container.find("[static]");
                if (staticElement.length) {
                    let that = this;
                    // load static image in the background to get the native image width and height
                    let nativeImg = new Image();
                    nativeImg.onload = function() {
                        let img = this as HTMLImageElement;
                        that.convertToPercent(img.height, img.width);
                        img.remove();
                    };
                    nativeImg.src = staticElement.attr("src");
                }
                else {
                    this.convertToPercent(this.container.height(), this.container.width());
                }
            }, 100);    
        });
    }

    convertToPercent(containerHeight, containerWidth) {
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
                        case 'cls': result = this.cls(element, rule.exp, msg.payload); break;
                        case 'css': result = this.css(element, rule.exp, msg.payload); break;
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
            return eval('(' + exp + '); ' + this.expressionGlobals);    
        } catch (error) {
            console.log("Animation evaluate error:", error);
        }
    }

    // Example vis expressions:
    // {x} > 0
    // {x} === "On"
    private vis(element, exp, payload?) {
        let result = this.evaluate(exp, payload);
        if (result) {
            element.show();
        }
        else {
            element.hide();
        }
        return result;
    }

    // Example src expressions:
    // {x} > 0 ? "valve_open.png" : "valve_closed.png"
    // if ({x} === "On") { return "fan_on.gif"; } else { return "fan_off.gif" }
    private src(element, exp, payload) {
        if (!element.is("img")) {
            console.log('Animation failed to process source rule because element is not an image (img)', element);
            return;
        }
        let result = this.evaluate(exp, payload);
        element.attr("src", result);
        return result;
    }

    // Example sub expressions:
    // {x}
    // parseInt({x} / 10)
    // parseInt(1 + {x} / (100 / 9))
    // Math.round({x} / 10)
    // parseInt( interpolate({x}, 0, 100, 1, 10) )
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
        let result = this.evaluate(exp, payload);
        let newSrc = srcParts[1] + result + srcParts[3];
        element.attr("src", newSrc);
        return newSrc;
    }

    // Example cls expressions:
    // { "alarm": {x} === "Alarm", "success": {x} !== "Alarm" }
    // { "success": {x} === "On" }
    private cls(element, exp, payload) {
        let result = this.evaluate(exp, payload);
        Object.keys(result).forEach(classname => {
            if (!result[classname]) {
                element.removeClass(classname);
            }
            else {
                element.addClass(classname);
            }
        });        
        return result;
    }

    // Example css expressions:
    // {x} === "Alarm" ? { background:"red", color:"white" } : { background:"green", color:"black" }
    // { background: ({x} === "On" ? "green" : "") }
    // { opacity: {x} / 100 }
    // { opacity: ({x} > 0 ? 1.0 : 0.5) }
    private css(element, exp, payload) {
        let result = this.evaluate(exp, payload);
        element.css(result);
        return result;
    }
}

interface AnimationRule {
    img: string;
    topic: string;
    prop: string;
    exp: string;
}