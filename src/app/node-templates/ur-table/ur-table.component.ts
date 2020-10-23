import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
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
export class UrTableComponent extends BaseNode implements AfterViewInit {
	private expressionGlobals = `
		function interpolate(value, minIn, maxIn, minOut, maxOut) {
			let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
			return Math.max(minOut, Math.min(maxOut, out));
		}
	`;
	name: string;
	field: string;
	device: string;
	point: string;
	config: configuration[];
	devices: any[];
	points: any[];
	pivot: Boolean;
	lep: RegExp;
	glp: RegExp;
	regexPoints: RegExp;
	regex: RegExp;
	displayedColumns: string[] = [];
	dataSource: {};
	dataLink: {};
	label: string;
	regexIndex: RegExp;

	ngOnInit(): void {
		this.name = this.data.label;
		this.devices = new Array();
		this.points = new Array();
		this.config = this.data.fields;
		this.pivot = this.data.pivot;
		this.dataSource = {};
		this.dataLink = {};
		this.regexPoints = /(\d+)(\_)/;
		this.regexIndex = /(.*)(\_)(\d+)/;
		this.lep = /([^\/]+)\/(if|fb)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
		this.glp = /([^\/]+)\/(if|fb)\/(Web Server)\/(\d+)\/(.*)/;
		// console.log('fields',this.config);
	}

	ngAfterViewInit(): void {
		super.ngAfterViewInit();
		this.setupDatapointAccess();
	}

	updateValue(data: any) {
		super.updateValue(data);
		if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
			// console.log('data',data);
			let found = null;
			this.config.forEach(element => {
				this.field = element.display;
				this.device;
				this.point;
				let devIndex;

				try {
					switch (element.deviceType) {
						// case 'lep': this.device = this.lep.exec(data.msg.topic)[1]; break;
						case 'webApp':
							let isGLP = data.msg.topic.startsWith('glp');
							let nv = '';
							// console.log('isGLP: ', isGLP);
							if (isGLP) {
								this.device = this.glp.exec(data.msg.topic)[4];
								devIndex = this.glp.exec(data.msg.topic)[5];
								// console.log('this.device', this.device);
								this.point = 'Web Server[' + this.device + ']' + devIndex;
								// console.log('this.point 1: ', this.point);
							} else {
								this.device = this.lep.exec(data.msg.topic)[3];
								nv = this.lep.exec(data.msg.topic)[5];
								devIndex = this.regexIndex.exec(nv)[1];
								this.point = this.device + devIndex;
								// console.log('this.point 2: ', this.point);
							}
							break;
						case 'custom':
							this.regex = new RegExp(element.device);
							this.device = this.regex.exec(data.msg.topic)[1];
							break;
						default: this.device = 'not valid'; break;
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
				found = this.points.find(v => v.name == this.point);
				if (!found && (this.point !== undefined)) {
					this.points.push({
						name: this.point,
					});
					this.points.sort(this.compareValues('name'));
				}

				if (this.point) {
					if (!this.dataSource[this.point]) {
						this.dataSource[this.point] = {};
					}
					if (!this.dataLink[this.point]) {
						this.dataLink[this.point] = {};
					}
					if (data.msg.topic.includes(element.param) || element.formatType == 'link') {
						if (element.formatType == 'link') {
							if (devIndex) {
								this.dataSource[this.point][this.field] = element.param.replace('{x}', devIndex);
								this.dataLink[this.point][this.field] = element.format.replace('{x}', devIndex);
							} else {
								this.dataSource[this.point][this.field] = element.param.replace('{x}', this.device);
								this.dataLink[this.point][this.field] = element.format.replace('{x}', this.device);
							}
						} else {
							let values = element.display.split('.');
							let result = data.msg;
							try {
								for (let i = 0; i < values.length; i++) {
									result = result[values[i]];
								}
								switch (element.formatType) {
									case 'fText': this.dataSource[this.point][this.field] = this.sub(element.format, element.unit, result); break;
									default: this.dataSource[this.point][this.field] = result; break;
								}
								// console.log('this.dataSource[this.point][this.field]', this.dataSource[this.point][this.field],'field', this.field, 'point', this.point);
							} catch (e) { }
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

	private evaluate(exp: any, value?: any) {
		try {
			if (typeof value !== 'undefined') {
				exp = exp.replace(/\{x\}/g, value);
			}
			return eval('(' + exp + '); ' + this.expressionGlobals);
		} catch (error) {
			// console.log("Evaluate error:", error);
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
		// console.log('exp',exp, 'unit', unit, 'payload', payload)
		let expObj;
		let result;
		try {
			if (!exp.includes('{x}')) {
				expObj = JSON.parse(exp);
				result = expObj[payload];
				// console.log('exp', expObj, 'payload', payload, 'result', result);
				return result;
			}
		} catch (e) { console.log(e) }
		result = this.evaluate(exp, payload);
		if (unit !== 'nothing') {
			result = result + ' ' + unit;
		}
		return result;
	}
}
