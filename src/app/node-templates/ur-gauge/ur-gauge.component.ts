import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ColorHelper } from '@swimlane/ngx-charts';
import { BaseNode } from '../ur-base-node';
import { BarStacker } from './BarStacker';
import { LiquidFillGauge } from './LiquidFillGauge';

declare const $: any;

@Component({
    selector: 'app-ur-gauge',
    templateUrl: './ur-gauge.component.html',
    styleUrls: ['./ur-gauge.component.sass'],
})
export class UrGaugeComponent extends BaseNode implements OnInit {
    dialGaugeOpt = {
        view: null,
        animation: true,
        colorScheme: {
            domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
        },
        startAngle: -120,
        angleSpan: 240,
    };

    private labels = {};
    dialGaugeResults = [];
    legendNames = [];
    legendColors: ColorHelper = new ColorHelper('cool', 'ordinal', [], null);

    @ViewChildren("liquidGauge") liquidGaugeElems: QueryList<ElementRef>;
    private liquidGauges = {};

    @ViewChildren("levelGauge") levelGaugeElems: QueryList<ElementRef>;
    private levelGauges = {};

    ngOnInit(): void {
        for (let topic of this.data.topics) {
            topic.topic = this.evalInstanceParameters(topic.topic); // handle multi-page. substitute {variables}
            this.labels[topic.topic] = topic.label;
            this.legendNames.push(topic.label);
            this.dialGaugeResults.push({ name: topic.label, value: 0 });
        }
        if (!isNaN(this.data.min)) {
            this.data.min = parseFloat(this.data.min);
        }
        if (!isNaN(this.data.max)) {
            this.data.max = parseFloat(this.data.max);
        }
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        if (this.data.gtype === 'level-vert' || this.data.gtype === 'level-horz') {
            this.levelGauges = this.initLevelGauges();
        } else if (this.data.gtype === 'liquid') {
            this.liquidGauges = this.initLiquidGauges();
        } else {
            this.initDialGauges();
        }
        this.onResize();
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            let value = this.formatFromData(data);
            if (this.data.gtype === 'level-vert' || this.data.gtype === 'level-horz') {
                let gauge = this.levelGauges[data.msg.topic];
                if (gauge) {
                    gauge.update(value);
                }
            } else if (this.data.gtype === 'liquid') {
                let gauge = this.liquidGauges[data.msg.topic];
                if (gauge) {
                    gauge.update(value);
                }
            } else { // regular, circle, over, and under gauges
                this.updateDialGauge(data, value);
            }
        }
    }

    @HostListener('window:resize')
    onResize() {
        if (this.data.gtype == 'level-vert' || this.data.gtype === 'level-horz') {
            this.resizeLevelGauges();
        } else if (this.data.gtype === 'liquid') {
            this.resizeLiquidGauges();
        } else { // regular, circle, over, and under gauges
            this.resizeGauge();
        }
    }


    /*
     * Dial Gauge Methods
     */

    private initDialGauges() {
        this.dialGaugeOpt.colorScheme.domain = this.data.colors;
        this.legendColors = new ColorHelper(
            this.dialGaugeOpt.colorScheme,
            'ordinal',
            this.legendNames,
            this.dialGaugeOpt.colorScheme
        );
        switch (this.data.gtype) {
            case 'gauge':
                this.dialGaugeOpt.startAngle = -120;
                this.dialGaugeOpt.angleSpan = 240;
                break;
            case 'circle':
                this.dialGaugeOpt.startAngle = 0;
                this.dialGaugeOpt.angleSpan = 360;
                break;
            case 'over':
                this.dialGaugeOpt.startAngle = 270;
                this.dialGaugeOpt.angleSpan = 180;
                break;
            case 'under':
                this.dialGaugeOpt.startAngle = -270;
                this.dialGaugeOpt.angleSpan = 180;
                break;
        }
    }

    private updateDialGauge(data: any, value) {
        let name = this.labels[data.msg.topic] || data.msg.topic;
        if (data.msg.payload.units) {
            name += ' (' + data.msg.payload.units + ')';
        }
        let result = this.dialGaugeResults.find((r) => r.name === name);
        if (result) {
            result.value = value;
        } else {
            this.dialGaugeResults.push({ name, value });
        }
        // refresh gauge
        this.dialGaugeResults = [...this.dialGaugeResults];
        // refresh legend
        if (!this.legendNames.includes(name)) {
            this.legendNames = this.dialGaugeResults.map((d) => d.name);
            this.legendColors = new ColorHelper(
                this.dialGaugeOpt.colorScheme,
                'ordinal',
                this.legendNames,
                this.dialGaugeOpt.colorScheme
            );
        }
    }

    private resizeGauge() {
        let gaugeContainer = this.container.find('.ur-gauge-container');
        let width = gaugeContainer.width();
        let gauge = this.container.find('.ngx-charts');
        gauge.width(width);
        let height = gauge.height();
        let scale = 1.1;
        let vbWidth = width / scale;
        let vbHeight = height / scale;
        let viewbox = [(width - vbWidth) / 2, (height - vbHeight) / 2, vbWidth, vbHeight];
        if (this.data.gtype === 'under') {
            // shift y position by half of the view box's height, minus some margin
            viewbox[1] += vbHeight / 2 - 20 /* margin */;
        }
        gauge.attr('viewBox', viewbox.join(' '));
    }


    /*
     * Level Gauge Methods
     */

    private initLevelGauges() {
        let topics = Object.keys(this.labels);
        let elems = this.levelGaugeElems.toArray();
        let gauges = {};
        for (let i = 0; i < elems.length; i++) {
            let topic = topics[i];
            let label = this.labels[topic] || topic;
            let gauge = new BarStacker(elems[i]);
            gauge.config.textPx = 20;
            gauge.config.cornerRoundingX = 5;
            gauge.config.cornerRoundingY = 5;
            gauge.config.vertical = this.data.gtype === 'level-vert';
            gauge.config.minValue = this.data.min;
            gauge.config.maxValue = this.data.max;
            gauge.config.color = this.data.colors[i];
            gauges[topic] = gauge.loadBarStacker(label);
        }
        return gauges;
    }

    private resizeLevelGauges() {
        let gaugeContainer = this.container.find('.ur-gauge-container');
        let width = gaugeContainer.width();
        let height = gaugeContainer.height();
        let gauge = this.container.find('.ur-gauge-level');
        let vbWidth = gauge.width();
        if (!gauge.attr('viewBox')) {
            if (this.data.gtype === 'level-vert') {
                let maxWidth = width / this.data.topics.length;
                let aspectRatio = maxWidth / height;
                let viewbox = [0, 0, vbWidth, vbWidth / aspectRatio];
                gauge.attr('viewBox', viewbox.join(' '))
                    .css('max-width', maxWidth);
            }
            else {
                let maxHeight = height / this.data.topics.length;
                let aspectRatio = width / maxHeight;
                let viewbox = [0, 0, vbWidth, vbWidth / aspectRatio];
                gauge.attr('viewBox', viewbox.join(' '))
                    .attr('width', '').attr('height', '')
                    .css('max-height', maxHeight);
            }
        }
    }

    /*
     * Liquid Gauge Methods
     */

    private initLiquidGauges() {
        let topics = Object.keys(this.labels);
        let elems = this.liquidGaugeElems.toArray();
        let gauges = {};
        for (let i = 0; i < elems.length; i++) {
            let topic = topics[i];
            let label = this.labels[topic];
            let gauge = new LiquidFillGauge(elems[i]);
            gauge.config.circleColor = this.data.colors[i];
            gauge.config.waveColor = this.data.colors[i];
            gauge.config.textColor = '#000000A0';
            gauge.config.waveTextColor = '#FFFFFFA0';
            gauge.config.circleThickness = 0.2;
            gauge.config.waveAnimateTime = 1000;
            gauge.config.minValue = this.data.min;
            gauge.config.maxValue = this.data.max;
            gauge.config.textVertPosition = label ? 0.4 : 0.5;
            gauge.config.labelVertPosition = 0.85;
            gauge.config.textSize = 1;
            gauge.config.labelSize = 0.5;
            gauge.config.units = this.data.units || '';
            gauges[topic] = gauge.loadLiquidFillGauge(label);
        }
        return gauges;
    }

    private resizeLiquidGauges() {
        let gaugeContainer = this.container.find('.ur-gauge-container');
        let width = gaugeContainer.width();
        let height = gaugeContainer.height();
        let gauge = this.container.find('.ur-gauge-liquid');
        if (!gauge.attr('viewBox')) {
            gauge.attr('width', gauge.width()).attr('height', gauge.height());
            let vbHeight = parseInt(gauge.attr('height'));
            let viewbox = [vbHeight / 2, 0, vbHeight, vbHeight];
            gauge.attr('viewBox', viewbox.join(' '));
        }
        gauge.width(width / this.data.topics.length);
        gauge.height(height);
    }
}
