import { Component, AfterViewInit } from '@angular/core';
import { BaseNode } from '../ur-base-node';

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
	sortedDeviceList = [];
	dataSource = {};
	dataLink = {};

	ngAfterViewInit(): void {
		super.ngAfterViewInit();
		this.setupDatapointAccess();
	}

	updateValue(data: any) {
		super.updateValue(data);
		if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
			this.data.fields.forEach(element => {
				let prop = element.display;
				let deviceName = null;
				let pointName = null;
				try {
					let regex = /glp\/.+\/fb\/dev\/(.+\/if\/[^\/]+\/\d+)\/(.*)/; // default to SSIoT
					switch (element.deviceType) {
						case 'custom': regex = new RegExp(element.device); break;
					}
					let parts = regex.exec(data.msg.topic);
					deviceName = parts[1];
					pointName = parts[2];
				} catch (ignore) {}

				if (deviceName && pointName && pointName.includes(element.param)) {
					if (element.formatType === 'link') {
						if (!this.dataLink[deviceName]) {
							this.dataLink[deviceName] = {};
						}
						let text = this.evalVariables(element.format, this.data?.instance);
						let href = this.evalVariables(element.display, this.data?.instance);
						this.dataLink[deviceName][pointName] = { href, text };
					}
					if (!this.dataSource[deviceName]) {
						this.dataSource[deviceName] = {};
						this.sortedDeviceList.push(deviceName);
						this.sortedDeviceList.sort();
					}
					let point = this.dataSource[deviceName][pointName] || {};
					let values = element.display.split('.');
					let result = data.msg;
					try {
						for (let i of values) {
							result = result[i];
						}
						point[prop] = element.formatType === 'fText' 
							? this.sub(element.format, element.unit, result)
							: result;
					} catch (ignore) {}
					this.dataSource[deviceName][pointName] = point;
				}
			});
		}
	};

	private evaluate(exp: any, value?: any) {
		try {
			if (typeof value !== 'undefined') {
				exp = exp.replace(/\{x\}/ig, value); //{x} is a table expression variable not a topic variable
			}
			return eval('(' + exp + '); ' + this.expressionGlobals);
		} catch (ignore) {}
		return value;
	}

	// Example sub expressions:
	// {x}
	// parseInt({x} / 10)
	// parseInt(1 + {x} / (100 / 9))
	// Math.round({x} / 10)
	// parseInt( interpolate({x}, 0, 100, 1, 10) )
	// Enumeration {"0": "Offline","1": "Cooling","2": "Economizer","3": "Reheat","4": "Heat","5": "Zero CFM","6": "Air Balance","7": "Forced Damper","8": "Forced CFM","9": "Forced Reheat","10": "Forced Setpoint","11": "Forced Damper and Reheat","12": "Forced Damper and Setpoint","13": "Forced Damper, Reheat, and Setpoint","14": "Forced CFM and Reheat","15": "Forced CFM and Setpoint","16": "Forced CFM, Reheat, and Setpoint","17": "Forced Reheat and Setpoint","18": "Morning Warm-Up","19": "Ventilation"}
	private sub(exp, unit, payload) {
		try {
			if (!exp.toLowerCase().includes('{x}')) {
				let expObj = JSON.parse(exp);
				return expObj[payload];
			}
		} catch (ignore) {}
		let result = this.evaluate(exp, payload);
		if (unit !== 'nothing') {
			result = result + ' ' + unit;
		}
		return result;
	}
}
