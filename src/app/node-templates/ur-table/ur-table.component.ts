import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { WebSocketService } from '../../services';

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
export class UrTableComponent implements OnInit {
	private expressionGlobals = `
		function interpolate(value, minIn, maxIn, minOut, maxOut) {
			let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
			return Math.max(minOut, Math.min(maxOut, out));
		}
	`;
	@Input() data: any;
	nodeId: string;
	name: string;
	field: string;
	device: string;
	dataPivot: data[];
	config: configuration[];
	devices: any[];
	points: any[];
	pivot: Boolean;
	ssiot: RegExp;
	regexPoints: RegExp;
	regex: RegExp;
	displayedColumns: string[] = [];
	dataSource: {};

	constructor(private webSocketService: WebSocketService) { }

	ngOnInit(): void {
		this.name = this.data.label;
		this.nodeId = this.data.id;
		this.dataPivot = new Array();
		this.devices = new Array();
		this.points = new Array();
		this.config = this.data.fields;
		this.pivot = this.data.pivot;
		this.dataSource = {};
		this.regexPoints = /(\d+)(\_)/;
		this.ssiot = /([^\/]+)\/(if|fb)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/; // OLD:/([^\/]+)\/(if|fb)\//;  TODO: Select FB or points /([^\/]+)\/(if|fb)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/
		console.log('fields',this.config);

		this.webSocketService.listen('update-value').subscribe((data: any) => {
			if (this.nodeId == data.id) {
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
						if (data.msg.topic.includes(element.param) || element.formatType == 'link') {
							if(element.formatType == 'link'){
								if(devIndex)
									this.dataSource[point][this.field] = element.param.replace('{x}',devIndex); 
								else
									this.dataSource[point][this.field] = element.param;
								// console.log('this.dataSource[point][this.field]', this.dataSource[point][this.field], 'element.param', element.param, 'point', point);
							}else{
								let values = element.display.split('.');
								let result = data.msg;
								try{
									for (let i = 0; i < values.length; i++) {
										// console.log('data.msg', result[values[i]], 'values', values[i]);
										result = result[ values[i] ];
									}
									
									switch(element.formatType){
										case 'fText': this.dataSource[point][this.field] = this.sub(element.format, element.unit,result); break;
										default: this.dataSource[point][this.field] = result; break;
									}
									// console.log('this.dataSource[point][this.field]', this.dataSource[point][this.field], 'this.field', this.field, 'point', point);
								}catch(e){}
							}
						}
					}
					// console.log('dataSource', this.dataSource);
				});
				// }
				// found = this.dataPivot.find(v => v.topic == data.msg.topic);
				// if (found) {
				// 	this.dataPivot.find(v => v.topic == data.msg.topic).payload = data.msg.payload;
				// } else {
				// 	this.dataPivot.push(data.msg);
				// }
				// this.dataPivot.sort(this.compareValues('topic'));
			}
		});
	}

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
    private sub(exp, unit, payload) {
		let result = this.evaluate(exp, payload);
		if(unit  !== 'nothing'){
			result = result + ' ' + unit;
		}
        return result;
	}
	

    // Example stringSub expressions:
    // {x} === "OC_OCCUPIED" ? "Occupied" : "Unoccupied"
    private stringSub(exp, unit, payload) {
        let result = this.evaluate(exp, payload);
        return result;
    }

}
