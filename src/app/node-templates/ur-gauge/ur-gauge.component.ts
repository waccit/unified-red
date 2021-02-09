import { Component, HostListener, OnInit } from '@angular/core';
import { ColorHelper } from '@swimlane/ngx-charts';
import { BaseNode } from '../ur-base-node';

declare const $: any;

@Component({
    selector: 'app-ur-gauge',
    templateUrl: './ur-gauge.component.html',
    styleUrls: ['./ur-gauge.component.sass'],
})
export class UrGaugeComponent extends BaseNode implements OnInit {
    gaugeOpt = {
        view: null,
        animation: true,
        colorScheme: {
            domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
        },
        startAngle: -120,
        angleSpan: 240,
        gtype: 'gauge'
    };

    private labels = {};
    graphedResults = [];
    legendNames = [];
    legendColors: ColorHelper = new ColorHelper('cool', 'ordinal', [], null);

    ngOnInit(): void {
        for (let topic of this.data.topics) {
            topic.topic = this.evalInstanceParameters(topic.topic); // handle multi-page. substitute {variables}
            this.labels[topic.topic] = topic.label;
            this.legendNames.push(topic.label);
            this.graphedResults.push({ name: topic.label, value: 0 });
        }
        if (!isNaN(this.data.min)) {
            this.data.min = parseFloat(this.data.min);
        }
        if (!isNaN(this.data.max)) {
            this.data.max = parseFloat(this.data.max);
        }
        this.gaugeOpt.colorScheme.domain = this.data.colors;
        this.gaugeOpt.gtype = this.data.gtype;
        this.legendColors = new ColorHelper(this.gaugeOpt.colorScheme, 'ordinal', this.legendNames, this.gaugeOpt.colorScheme);

        switch (this.gaugeOpt.gtype) {
            case 'gauge':
                this.gaugeOpt.startAngle = -120;
                this.gaugeOpt.angleSpan = 240;
                break;
            case 'circle':
                this.gaugeOpt.startAngle = 0;
                this.gaugeOpt.angleSpan = 360;
                break;
            case 'over':
                this.gaugeOpt.startAngle = 270;
                this.gaugeOpt.angleSpan = 180;
                break;
            case 'under':
                this.gaugeOpt.startAngle = -270;
                this.gaugeOpt.angleSpan = 180;
                break;
        }
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.resizeGauge();
    }

    updateValue(data: any) {
		super.updateValue(data);
		if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            let name = this.labels[data.msg.topic] || data.msg.topic;
            if (data.msg.payload.units) {
                name += ' (' + data.msg.payload.units + ')';
            }
            let value = this.formatFromData(data);
            let result = this.graphedResults.find(r => r.name === name);
            if (result) {
                result.value = value;
            } else {
                this.graphedResults.push({ name, value });
            }
            // refresh gauge
            this.graphedResults = [...this.graphedResults];
            // refresh legend
            if (!this.legendNames.includes(name)) {
                this.refreshLegend();
            }
        }
    }

    private refreshLegend() {
        this.legendNames = this.graphedResults.map(d => d.name);
        this.legendColors = new ColorHelper(this.gaugeOpt.colorScheme, 'ordinal', this.legendNames, this.gaugeOpt.colorScheme);
    }

    @HostListener('window:resize')
    resizeGauge() {
        let gaugeContainer = this.container.find('.ur-gauge-container');
        let width = gaugeContainer.width();
        let ngxCharts = this.container.find('.ngx-charts');
        ngxCharts.width(width);
        let height = ngxCharts.height();
        let scale = 1.1;
        let vbWidth = width / scale;
        let vbHeight = height / scale;
        let viewbox = [
            (width - vbWidth) / 2,
            (height - vbHeight) / 2,
            vbWidth, 
            vbHeight
        ];
        if (this.gaugeOpt.gtype === 'under') {
            // shift y position by half of the view box's height, minus some margin
            viewbox[1] += vbHeight / 2 - 20 /* margin */;
        }
        ngxCharts.attr("viewBox", viewbox.join(' '));
    }
}
