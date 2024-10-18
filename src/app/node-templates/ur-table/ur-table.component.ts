import { Component, AfterViewInit, Renderer2 } from '@angular/core';
import { CurrentUserService, MenuService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BaseNode } from '../ur-base-node';
import { StyleService } from '../../services/style.service';

@Component({
	selector: 'app-ur-table',
	templateUrl: './ur-table.component.html',
	styleUrls: ['./ur-table.component.sass']
})
export class UrTableComponent extends BaseNode implements AfterViewInit {
	sortedDeviceList = [];
	dataSource = {};
	dataLink = {};
	private pages = {};

	constructor(
    protected webSocketService: WebSocketService,
    protected currentUserService: CurrentUserService,
    protected roleService: RoleService,
		protected snackbar: SnackbarService,
		private menuService: MenuService,
    protected styleService: StyleService,
	protected renderer: Renderer2
    ) {
		super(webSocketService, currentUserService, roleService, snackbar, styleService, renderer);
	}

	ngAfterViewInit(): void {
		super.ngAfterViewInit();
		this.setupDatapointAccess();
		this.menuService.pages.subscribe(p => { this.pages = p });
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
						let page = this.findPageInstanceByTopic(data.msg, element.format);
						this.dataLink[deviceName][pointName] = { text: page.title, href: page.path };
					}
					if (!this.dataSource[deviceName]) {
						this.dataSource[deviceName] = {};
						this.sortedDeviceList.push(deviceName);
						this.sortedDeviceList.sort();
					}
					let point = this.dataSource[deviceName][pointName] || {};
					try {
						if (element.formatType === 'text') {
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

        this.styleService.setStyle(data, pointName);
		this.styleService.setClass(data, pointName);
			});
		}
	}

	findPageInstanceByTopic(msg, nodeId) {
		let newId = nodeId;
		let topic = msg.topic;
		let topicPattern = this.data.topicPattern;
		let firstPage = Object.values<any>(this.pages).find(p => p.id.startsWith(nodeId));
		if (topic && topicPattern && firstPage && firstPage.instance && firstPage.instance._idVar) {
			let idVar = firstPage.instance._idVar;
	
			//
			// START --- Copied from ui.js at line 352 ---
			//
			// find and escape hyphen, brackets, parentheses, plus, punctuation, backslash,
			// caret, dollar, vertical bar, and pound symbols
			let topicRegex = topicPattern.replace(/[-[\]()+?.,\\^$|#]/g, '\\$&');
			// find and replace wildcard (*)
			topicRegex = topicRegex.replace(/\*/g, '.*');
			// find and replace capture group (idVar)
			topicRegex = topicRegex.replace(new RegExp('{' + idVar + '}', 'gi'), '([\\w\\. ]+)');
			// find and replace ignored {variables}
			topicRegex = topicRegex.replace(/\{.*}/g, '[\\w\\. ]+');
	
			// make new regex
			topicRegex = new RegExp('^' + topicRegex + '$');
	
			let topicArr = topicRegex.exec(topic);
	
			if (topicArr) {
				let destinationInstNum = topicArr[1];
				newId += '.' + idVar + destinationInstNum;
			}
			//
			// END --- Copied from ui.js at line 352 ---
			//
		}
		return this.pages[newId];
	}
}
