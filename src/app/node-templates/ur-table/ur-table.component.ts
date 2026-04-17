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

	private wildcardMatch(str: string, pattern: string): boolean {
		let parts = pattern.split('*');

		if (parts.length === 1) return str === pattern;

		let pos = 0;

		if (parts[0].length) {
			if (!str.startsWith(parts[0])) return false;
			pos = parts[0].length;
		}

		for (let i = 1; i < parts.length - 1; i++) {
			let idx = str.indexOf(parts[i], pos);
			if (idx === -1) return false;
			pos = idx + parts[i].length;
		}

		let last = parts[parts.length - 1];
		if (last.length) {
			if (!str.endsWith(last)) return false;
			if (str.length - last.length < pos) return false;
		}

		return true;
	}

	findPageInstanceByTopic(msg, nodeId) {
		let topic = msg.topic;
		let topicPattern = this.data.topicPattern;
		if (!topic || !topicPattern) return this.pages[nodeId];

		// Primary: iterate over known page instances and test the topic
		// against the pattern with the instance's variable values substituted.
		// Uses simple wildcard string matching — no regex needed.
		let candidatePages = Object.values<any>(this.pages).filter(p => p.id.startsWith(nodeId) && p.instance);
		for (let page of candidatePages) {
			let params = page.instance.parameters;
			if (!params) continue;

			let concrete = topicPattern;
			for (let key of Object.keys(params)) {
				concrete = concrete.replaceAll('{' + key + '}', String(params[key]));
			}
			concrete = concrete.replace(/\{[^}]*\}/g, '*');

			if (this.wildcardMatch(topic, concrete)) {
				return page;
			}
		}

		// Fallback: regex extraction using .* for * (multi-segment wildcard)
		let escapeRe = (s: string) => s.replace(/[-[\]()+?.,\\^$|#]/g, '\\$&');
		let firstPage = candidatePages[0];
		if (firstPage && firstPage.instance && firstPage.instance._idVar) {
			let idVar = firstPage.instance._idVar;
			let r = escapeRe(topicPattern).replace(/\*/g, '.*');
			r = r.replace(new RegExp('\\{' + idVar + '\\}', 'gi'), '([\\w\\. ]+)');
			r = r.replace(/\{[^}]*}/g, '[\\w\\. ]+');
			let topicArr = new RegExp('^' + r + '$').exec(topic);
			if (topicArr) {
				let newId = nodeId + '.' + idVar + topicArr[1];
				return this.pages[newId];
			}
		}

		return this.pages[nodeId];
	}
}
