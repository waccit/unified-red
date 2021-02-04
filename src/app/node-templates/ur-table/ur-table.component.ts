import { Component, AfterViewInit } from '@angular/core';
import { BaseNode } from '../ur-base-node';

@Component({
	selector: 'app-ur-table',
	templateUrl: './ur-table.component.html',
	styleUrls: ['./ur-table.component.sass']
})
export class UrTableComponent extends BaseNode implements AfterViewInit {
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
				let prop = element.label;
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
						let text = this.evalVariables(element.format);
						let href = this.evalVariables(element.display);
						this.dataLink[deviceName][pointName] = { href, text };
					}
					if (!this.dataSource[deviceName]) {
						this.dataSource[deviceName] = {};
						this.sortedDeviceList.push(deviceName);
						this.sortedDeviceList.sort();
					}
					let point = this.dataSource[deviceName][pointName] || {};
					try {
						if (element.formatType === 'fText') {
							point[prop] = this.formatFromData(data, element.format);
							// Add units
							if (element.unitType === 'unit') {
								point[prop] += ' ' + element.unit;
							} else if (data.msg.payload?.units) {
								point[prop] += ' ' + data.msg.payload.units;
							}
						}
						else {
							point[prop] = this.formatFromData(data, element.format);
						}
					} catch (ignore) {}
					this.dataSource[deviceName][pointName] = point;
				}
			});
		}
	};
}
