import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { WebSocketService } from '../../services';
import { BaseNode } from '../ur-base-node';

export interface data {
	topic: string;
	payload: string;
}

export interface configuration {
	label: string;
	formatType: string;
	format: string;
	display: string;
	device: string;
	deviceType: string;
	param: string;
	unitType: string;
	unit: string;
}

@Component({
	selector: 'app-ur-table',
	templateUrl: './ur-table.component.html',
	styleUrls: ['./ur-table.component.sass']
})
export class UrTableComponent extends BaseNode {
	private expressionGlobals = `
		function interpolate(value, minIn, maxIn, minOut, maxOut) {
			let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
			return Math.max(minOut, Math.min(maxOut, out));
		}
	`;
	name: string;
	field: string;
	device: string;
	config: configuration[];
	devices: any[];
	points: any[];
	pivot: Boolean; 
	ssiot: RegExp;
	regexPoints: RegExp;
	regex: RegExp;
	displayedColumns: string[] = [];
	dataSource: {};
	dataLink: {};
	label: string;

	ngOnInit(): void {
		this.name = this.data.label;
		this.devices = new Array();
		this.points = new Array();
		this.config = this.data.fields;
		this.pivot = this.data.pivot;
		this.dataSource = {};
		this.dataLink = {};
		this.regexPoints = /(\d+)(\_)/;
		this.ssiot = /([^\/]+)\/(if|fb)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/; // OLD:/([^\/]+)\/(if|fb)\//;
		// console.log('fields',this.config);
	}
	updateValue(data: any) {
		super.updateValue(data);
		if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
			// console.log('data',data);
			let found = null;
			this.config.forEach(element => {
				this.field = element.display;
				this.device;
				let point;
				let devIndex;
				
				try {
					switch (element.deviceType) {
						// case 'ssiot': this.device = this.ssiot.exec(data.msg.topic)[1]; break;
						case 'webApp':
							this.device = this.ssiot.exec(data.msg.topic)[3]; 
							let nv = this.ssiot.exec(data.msg.topic)[5];
							let instance = this.regexPoints.exec(nv)
							if(instance){
								point = this.device + instance[1];
								devIndex = instance[1];
							}else{
								point = this.device;
							}
						break;
						case 'custom':
							this.regex = new RegExp(element.device);
							this.device = this.regex.exec(data.msg.topic)[1];
							break;
						default: this.device = this.ssiot.exec(data.msg.topic)[1]; break;
					}
				} catch (error) {
					// console.log(error);
				}
				found = this.devices.find(v => v.name == this.device);
				if (!found && (this.device !== undefined)) {
					this.devices.push({
						name: this.device,
					});
					this.devices.sort(this.compareValues('name'));
				}
				// console.log('devices', this.devices);
				found = this.points.find(v => v.name == point);
				if (!found && (point !== undefined)) {
					this.points.push({
						name: point,
					});
					this.points.sort(this.compareValues('name'));
				}
				if (point) {
					if (!this.dataSource[point]) {
						this.dataSource[point] = {};
					}
					if (!this.dataLink[point]) {
						this.dataLink[point] = {};
					}
					if (data.msg.topic.includes(element.param) || element.formatType == 'link') {
						if(element.formatType == 'link'){
							if(devIndex){
								this.dataSource[point][this.field] = element.param.replace('{x}',devIndex);
								this.dataLink[point][this.field] = element.format.replace('{x}',devIndex);
							}else{
								this.dataSource[point][this.field] = element.param.replace('{x}',this.device);
								this.dataLink[point][this.field] = element.format.replace('{x}',this.device);
							}
						}else{
							let values = element.display.split('.');
							let result = data.msg;
							try{
								for (let i = 0; i < values.length; i++) {
									result = result[ values[i] ];
								}
								switch(element.formatType){
									case 'fText': this.dataSource[point][this.field] = this.sub(element.format, element.unit,result); break;
									default: this.dataSource[point][this.field] = result; break;
								}
							}catch(e){}
						}
					}
				}
			});
		}
	};
	

	private compareValues(key, order = 'asc') {
		return function innerSort(a, b) {
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				// property doesn't exist on either object
				return 0;
			}

			const varA = (typeof a[key] === 'string')
				? a[key].toUpperCase() : a[key];
			const varB = (typeof b[key] === 'string')
				? b[key].toUpperCase() : b[key];

			let comparison = 0;
			if (varA > varB) {
				comparison = 1;
			} else if (varA < varB) {
				comparison = -1;
			}
			return (
				(order === 'desc') ? (comparison * -1) : comparison
			);
		};
	}

	private evaluate(exp:any, value?:any) {
        try {
            if (typeof value !== 'undefined') {
                exp = exp.replace(/\{x\}/g, value);
            }
            return eval('(' + exp + '); ' + this.expressionGlobals);    
        } catch (error) {
            console.log("Evaluate error:", error);
        }
	}
	
	// Example sub expressions:
    // {x}
    // parseInt({x} / 10)
    // parseInt(1 + {x} / (100 / 9))
    // Math.round({x} / 10)
	// parseInt( interpolate({x}, 0, 100, 1, 10) )
	// Enumeration {"0": "Offline","1": "Cooling","2": "Economizer","3": "Reheat","4": "Heat","5": "Zero CFM","6": "Air Balance","7": "Forced Damper","8": "Forced CFM","9": "Forced Reheat","10": "Forced Setpoint","11": "Forced Damper and Reheat","12": "Forced Damper and Setpoint","13": "Forced Damper, Reheat, and Setpoint","14": "Forced CFM and Reheat","15": "Forced CFM and Setpoint","16": "Forced CFM, Reheat, and Setpoint","17": "Forced Reheat and Setpoint","18": "Morning Warm-Up","19": "Ventilation"}
    private sub(exp, unit, payload) {
		let expObj;
		let result;
		try{
			if(!exp.includes('{x}')){
				expObj = JSON.parse(exp);
				result = expObj[payload];
				// console.log('exp', expObj, 'payload', payload, 'result', result);
				return result;
			}
		}catch(e){console.log(e)}
		result = this.evaluate(exp, payload);
		if(unit  !== 'nothing'){
			result = result + ' ' + unit;
		}
        return result;
	}
}
