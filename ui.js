var inited = false;

module.exports = function (RED) {
    if (!inited) {
        require('./api/install/install.service').init(RED.log, RED.settings);
        init(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
        inited = true;
    }
    return {
        add: add,
        addLink: addLink,
        addInheritedPage: addInheritedPage, // ?
        addBaseConfig: addBaseConfig,
        emit: emit,
        emitSocket: emitSocket,
        toNumber: toNumber.bind(null, false),
        toFloat: toNumber.bind(null, true),
        updateUi: updateUi,
        ev: ev,
        makeMenuTree: makeMenuTree,
    };
};

var fs = require('fs');
var path = require('path');
var events = require('events');
var socketio = require('./socket');
var serveStatic = require('serve-static');
var compression = require('compression');

// Unified API requires
const errorHandler = require('./api/error-handler');

var urVersion = require('./package.json').version;
var baseConfiguration = {};
var io;
var menu = [];
var inheritedPages = {}; // schema: <key=refPage.id, value=[inhPage1, inhPage2, inhPage3, ...]>
var globals = [];
var settings = {};
var updateValueEventName = 'update-value';
var currentValues = {};
var replayMessages = {};
var removeStateTimers = {};
var removeStateTimeout = 1000;
var ev = new events.EventEmitter();
var params = {};
ev.setMaxListeners(0);

// default manifest.json to be returned as required.
var mani = {
    name: 'Unified-RED Dashboard',
    short_name: 'Dashboard',
    description: 'A dashboard for Node-RED',
    start_url: './#/0',
    // background_color: '#910000',
    // theme_color: '#910000',
    display: 'standalone',
    icons: [
        { src: 'icon192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon120x120.png', sizes: '120x120', type: 'image/png' },
        { src: 'icon64x64.png', sizes: '64x64', type: 'image/png' },
    ],
};

function toNumber(keepDecimals, config, input, old, m, s) {
    if (input === undefined) {
        return;
    }
    if (typeof input !== 'number') {
        var inputString = input.toString();
        input = keepDecimals ? parseFloat(inputString) : parseInt(inputString);
    }
    if (s) {
        input = Math.round(Math.round(input / s) * s * 10000) / 10000;
    }
    return isNaN(input) ? config.min : input;
}

function emit(event, data) {
    io.emit(event, data);
}

function emitSocket(event, data) {
    if (data.hasOwnProperty('msg') && data.msg.hasOwnProperty('socketid') && data.msg.socketid !== undefined) {
        io.to(data.msg.socketid).emit(event, data);
    } else if (data.hasOwnProperty('socketid') && data.socketid !== undefined) {
        io.to(data.socketid).emit(event, data);
    } else {
        io.emit(event, data);
    }
}

function noConvert(value) {
    return value;
}

function beforeEmit(msg) {
    return msg;
}

function beforeSend(msg) {
    //do nothing
}

function enforceWebSocketsSchema(msg) {
    /*
    schema: {
        id: string,
        socketid: string,
        msg: { ...mqtt message... }
    }
    */
    let toEmit = { id: null, socketid: null, msg: {} };
    if (msg.id && msg.socketid && msg.msg) {
        toEmit.id = msg.id;
        toEmit.socketid = msg.socketid;
    }
    let recvMsg = msg.msg || msg;
    for (let property in recvMsg) {
        if (property[0] !== '_' && property !== 'qos' && property !== 'retain') {
            toEmit.msg[property] = recvMsg[property];
        }
    }
    return toEmit;
}

function setCurrentValue(id, topic, value) {
    if (!currentValues[id]) {
        currentValues[id] = {};
    }
    currentValues[id][topic] = value;
}

function getCurrentValue(id, topic) {
    return currentValues[id] ? currentValues[id][topic] : null;
}

function setReplayMessage(id, topic, value) {
    if (!replayMessages[id]) {
        replayMessages[id] = {};
    }
    replayMessages[id][topic] = value;
}

/* This is the handler for inbound msg from previous nodes...
options:
  node - the node that represents the control on a flow
  control - the control to be added
  folders - a stack of folder IDs that represent the hierarchy of folders this control belongs to 
  page - page config node that this control belongs to
  group - group config node that this control belongs to
  tab - tab config node that this control belongs to
  [emitOnlyNewValues] - boolean (default true).
      If true, it checks if the payload changed before sending it
      to the front-end. If the payload is the same no message is sent.
  [forwardInputMessages] - boolean (default true).
      If true, forwards input messages to the output
  [storeFrontEndInputAsState] - boolean (default true).
      If true, any message received from front-end is stored as state
  [persistentFrontEndValue] - boolean (default true).
      If true, last received message is send again when front end reconnect.

  [convert] - callback to convert the value before sending it to the front-end
  [beforeEmit] - callback to prepare the message that is emitted to the front-end

  [convertBack] - callback to convert the message from front-end before sending it to the next connected node
  [beforeSend] - callback to prepare the message that is sent to the output
*/
function add(opt) {
    clearTimeout(removeStateTimers[opt.node.id]);
    delete removeStateTimers[opt.node.id];

    if (typeof opt.emitOnlyNewValues === 'undefined') {
        opt.emitOnlyNewValues = true;
    }
    if (typeof opt.forwardInputMessages === 'undefined') {
        opt.forwardInputMessages = true;
    }
    if (typeof opt.storeFrontEndInputAsState === 'undefined') {
        opt.storeFrontEndInputAsState = true;
    }
    if (typeof opt.persistentFrontEndValue === 'undefined') {
        opt.persistentFrontEndValue = true;
    }
    opt.convert = opt.convert || noConvert;
    opt.beforeEmit = opt.beforeEmit || beforeEmit;
    opt.convertBack = opt.convertBack || noConvert;
    opt.beforeSend = opt.beforeSend || beforeSend;
    opt.control.id = opt.node.id;
    var remove = addControl(opt.folders, opt.page, opt.group, opt.tab, opt.control);

    opt.node.on('input', function (msg) {
        if (typeof msg.enabled === 'boolean') {
            var state = replayMessages[opt.node.id];
            if (!state) {
                if (msg.topic) {
                    state = { id: opt.node.id };
                    setReplayMessage(opt.node.id, msg.topic, state);
                }
            }
            state.disabled = !msg.enabled;
            io.emit(updateValueEventName, state); // dcj mu
        }

        // remove res and req as they are often circular
        if (msg.hasOwnProperty('res')) {
            delete msg.res;
        }
        if (msg.hasOwnProperty('req')) {
            delete msg.req;
        }

        // Retrieve the dataset for this node
        var oldValue = getCurrentValue(opt.node.id, msg.topic);

        // let any arriving msg.ui_control message mess with control parameters
        if (
            msg.ui_control &&
            typeof msg.ui_control === 'object' &&
            !Array.isArray(msg.ui_control) &&
            !Buffer.isBuffer(msg.ui_control)
        ) {
            var changed = {};
            for (var property in msg.ui_control) {
                if (msg.ui_control.hasOwnProperty(property) && opt.control.hasOwnProperty(property)) {
                    if (
                        property !== 'id' &&
                        property !== 'type' &&
                        property !== 'order' &&
                        property !== 'name' &&
                        property !== 'value' &&
                        property !== 'label' &&
                        property !== 'width' &&
                        property !== 'height'
                    ) {
                        opt.control[property] = msg.ui_control[property];
                        changed[property] = msg.ui_control[property];
                    }
                }
            }
            if (Object.keys(changed).length !== 0) {
                io.emit('ui-control', { control: changed, id: opt.node.id });
            }
            if (!msg.hasOwnProperty('payload')) {
                return;
            }
        }

        // Call the convert function in the node to get the new value
        // as well as the full dataset.
        var conversion = opt.convert(msg.payload, oldValue, msg, opt.control.step);

        // If the update flag is set, emit the newPoint, and store the full dataset
        var fullDataset;
        var newPoint;
        if (typeof conversion === 'object' && conversion.update !== undefined) {
            newPoint = conversion.newPoint;
            fullDataset = conversion.updatedValues;
        } else if (conversion === undefined) {
            fullDataset = oldValue;
            newPoint = true;
        } else {
            // If no update flag is set, this means the conversion contains
            // the full dataset or the new value (e.g. gauges)
            fullDataset = conversion;
        }

        // If we have something new to emit
        if (newPoint !== undefined || !opt.emitOnlyNewValues || oldValue != fullDataset) {
            setCurrentValue(opt.node.id, msg.topic, fullDataset);

            // Determine what to emit over the websocket
            // (the new point or the full dataset).

            // Always store the full dataset.
            var toStore;
            // prettier-ignore
            var toEmit = toStore = enforceWebSocketsSchema(msg);
            toStore.msg = opt.beforeEmit(toStore.msg, fullDataset);
            if (newPoint !== undefined && typeof newPoint !== 'boolean') {
                toEmit.msg = opt.beforeEmit(toEmit.msg, newPoint);
            } else {
                toEmit = toStore;
            }

            var addField = function (m) {
                if (opt.control.hasOwnProperty(m) && opt.control[m] && opt.control[m].indexOf('{{') !== -1) {
                    var a = opt.control[m].split('{{');
                    a.shift();
                    for (var i = 0; i < a.length; i++) {
                        var b = a[i].split('}}')[0].trim();
                        b.replace(/\"/g, '').replace(/\'/g, '');
                        if (b.indexOf('|') !== -1) {
                            b = b.split('|')[0];
                        }
                        if (b.indexOf(' ') !== -1) {
                            b = b.split(' ')[0];
                        }
                        if (b.indexOf('?') !== -1) {
                            b = b.split('?')[0];
                        }
                        b.replace(/\(/g, '').replace(/\)/g, '');
                        if (b.indexOf('msg.') >= 0) {
                            b = b.split('msg.')[1];
                            if (b.indexOf('.') !== -1) {
                                b = b.split('.')[0];
                            }
                            if (b.indexOf('[') !== -1) {
                                b = b.split('[')[0];
                            }
                            if (!toEmit.hasOwnProperty('msg')) {
                                toEmit.msg = {};
                            }
                            if (!toEmit.msg.hasOwnProperty(b) && msg.hasOwnProperty(b) && msg[b] !== undefined) {
                                if (Buffer.isBuffer(msg[b])) {
                                    toEmit.msg[b] = msg[b].toString('binary');
                                } else {
                                    toEmit.msg[b] = JSON.parse(JSON.stringify(msg[b]));
                                }
                            }
                        } else {
                            if (b.indexOf('.') !== -1) {
                                b = b.split('.')[0];
                            }
                            if (b.indexOf('[') !== -1) {
                                b = b.split('[')[0];
                            }
                            if (!toEmit.hasOwnProperty(b) && msg.hasOwnProperty(b)) {
                                if (Buffer.isBuffer(msg[b])) {
                                    toEmit[b] = msg[b].toString('binary');
                                } else {
                                    toEmit[b] = JSON.parse(JSON.stringify(msg[b]));
                                }
                            }
                        }
                    }
                }
            };

            // if label, format or color field is set to a msg property, emit that as well
            addField('label');
            addField('format');
            addField('color');
            addField('units');
            if (msg.hasOwnProperty('enabled')) {
                toEmit.disabled = !msg.enabled;
            }

            let newId = opt.node.id;
            if (opt.page.config.pageType === 'multi' || opt.page.config.isMulti) {
                let topic = msg.topic;
                let topicPattern = opt.control.topicPattern;
                let idVar = opt.control._idVar;

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
            }

            toEmit.socketid = toEmit.id = toStore.id = newId;

            emitSocket(updateValueEventName, toEmit);

            if (opt.persistentFrontEndValue) {
                if (toStore.msg && toStore.msg.topic) {
                    setReplayMessage(newId, toStore.msg.topic, toStore);
                }
            }

            // Handle the node output
            if (opt.forwardInputMessages && opt.node._wireCount) {
                msg.payload = opt.convertBack(fullDataset);
                msg = opt.beforeSend(msg) || msg;
                //if (settings.verbose) { console.log("UI-SEND",JSON.stringify(msg)); }
                opt.node.send(msg);
            }
        }
    });

    // This is the handler for messages coming back from the UI
    var handler = function (msg) {
        let idParts = msg.id.split('.');
        // prettier-ignore
        if (idParts.length === 3) { // is extended node id? (multi page)
            msg.id = idParts[0] + '.' + idParts[1]; // set id to base node id
        }
        if (msg.id !== opt.node.id) {
            return;
        } // ignore if not us
        if (settings.readOnly === true) {
            msg.value = getCurrentValue(msg.id, msg.topic);
        } // don't accept input if we are in read only mode
        else {
            var converted = opt.convertBack(msg.value);
            if (opt.storeFrontEndInputAsState === true) {
                setCurrentValue(msg.id, msg.topic, converted);
                if (opt.persistentFrontEndValue) {
                    if (msg && msg.topic) {
                        setReplayMessage(msg.id, msg.topic, msg);
                    }
                }
            }
            var toSend = { payload: converted };
            toSend = opt.beforeSend(toSend, msg) || toSend;
            toSend.socketid = toSend.socketid || msg.socketid;
            if (toSend.hasOwnProperty('topic') && toSend.topic === undefined) {
                delete toSend.topic;
            }
            if (!msg.hasOwnProperty('_fromInput')) {
                // TODO: too specific
                opt.node.send(toSend); // send to following nodes
            }
        }
        if (opt.storeFrontEndInputAsState === true) {
            //fwd to all UI clients
            io.emit(updateValueEventName, msg);
        }
    };

    ev.on(updateValueEventName, handler);

    // if (inheritedPages.hasOwnProperty(opt.page.id)) {
    //     // let inheritedOpt = updateAndClone(opt, { node: { ...opt.node, id: opt.node.id + '.inh' } });
    //     let inheritedOpt = updateAndClone(opt, {});
    //     inheritedOpt.node.id = opt.node.id + '.inh';
    //     // this.add();
    //     console.log('inheritedOpt: ', inheritedOpt);
    // }

    return function () {
        ev.removeListener(updateValueEventName, handler);
        remove();
        removeStateTimers[opt.node.id] = setTimeout(function () {
            delete currentValues[opt.node.id];
            delete replayMessages[opt.node.id];
        }, removeStateTimeout);
    };
}

//from: https://stackoverflow.com/a/28592528/3016654
function join() {
    var trimRegex = new RegExp('^\\/|\\/$', 'g');
    var paths = Array.prototype.slice.call(arguments);
    return (
        '/' +
        paths
            .map(function (e) {
                if (e) {
                    return e.replace(trimRegex, '');
                }
            })
            .filter(function (e) {
                return e;
            })
            .join('/')
    );
}

function init(server, app, log, redSettings) {
    var uiSettings = redSettings.ui || {};
    if (uiSettings.hasOwnProperty('path') && typeof uiSettings.path === 'string') {
        settings.path = uiSettings.path;
    } else {
        settings.path = '/';
    }
    if (uiSettings.hasOwnProperty('readOnly') && typeof uiSettings.readOnly === 'boolean') {
        settings.readOnly = uiSettings.readOnly;
    } else {
        settings.readOnly = false;
    }
    // settings.defaultGroupHeader = uiSettings.defaultGroup || 'Default';
    settings.verbose = redSettings.verbose || false;

    var fullPath = join(redSettings.httpNodeRoot, settings.path);
    var socketIoPath = join(fullPath, 'socket.io');

    socketio.connect(server, { path: socketIoPath });
    io = socketio.connection();

    var dashboardMiddleware = function (req, res, next) {
        next();
    };

    if (uiSettings.middleware) {
        if (typeof uiSettings.middleware === 'function') {
            dashboardMiddleware = uiSettings.middleware;
        }
    }

    fs.stat(path.join(__dirname, 'dist/index.html'), function (err, stat) {
        app.use(compression());
        if (!err) {
            app.use(join(settings.path, 'manifest.json'), function (req, res) {
                res.send(mani);
            });
            app.use(join(settings.path), dashboardMiddleware, serveStatic(path.join(__dirname, 'dist')));
        } else {
            log.info('[Dashboard] Dashboard using development folder');
            app.use(join(settings.path), dashboardMiddleware, serveStatic(path.join(__dirname, 'src')));
            var vendor_packages = [
                'angular',
                'angular-sanitize',
                'angular-animate',
                'angular-aria',
                'angular-material',
                'angular-touch',
                'angular-material-icons',
                'svg-morpheus',
                'font-awesome',
                'weather-icons-lite',
                'sprintf-js',
                'jquery',
                'jquery-ui',
                'd3',
                'raphael',
                'justgage',
                'angular-chart.js',
                'chart.js',
                'moment',
                'angularjs-color-picker',
                'tinycolor2',
                'less',
            ];
            vendor_packages.forEach(function (packageName) {
                app.use(
                    join(settings.path, 'vendor', packageName),
                    serveStatic(path.join(__dirname, 'node_modules', packageName))
                );
            });
        }

        // Define Unified API
        process.env.RED_SETTINGS_FILE = redSettings.settingsFile;
        app.use('/api', require('./api/api.controller'));
        app.use(errorHandler);
    });

    log.info('Unified-RED Dashboard version ' + urVersion + ' started at ' + fullPath);

    io.on('connection', function (socket) {
        ev.emit('newsocket', socket.client.id, socket.request.connection.remoteAddress);
        updateUi(socket);

        socket.on(updateValueEventName, ev.emit.bind(ev, updateValueEventName));
        socket.on('ui-replay-state', function (data) {
            if (data && data.id && replayMessages && replayMessages[data.id]) {
                setTimeout(function () {
                    let messages = Object.values(replayMessages[data.id]);
                    for (let msg of messages) {
                        socket.emit(updateValueEventName, msg);
                    }
                }, 50);
            }
            socket.emit('ui-replay-done');
        });
        socket.on('ui-change', function (folderIndex, pageIndex) {
            var name = '';
            if (
                folderIndex != null &&
                pageIndex != null &&
                !isNaN(folderIndex) &&
                !isNaN(pageIndex) &&
                menu.length > 0 &&
                menu[folderIndex].items.length > 0 &&
                folderIndex < menu.length &&
                pageIndex < menu[folderIndex].items.length &&
                menu[folderIndex] &&
                menu[folderIndex].items[pageIndex]
            ) {
                name =
                    menu[folderIndex].items[pageIndex].hasOwnProperty('header') &&
                    typeof menu[folderIndex].items[pageIndex].header !== 'undefined'
                        ? menu[folderIndex].items[pageIndex].header
                        : menu[folderIndex].items[pageIndex].name;
                ev.emit('changetab', index, name, socket.client.id, socket.request.connection.remoteAddress, params);
            }
        });
        socket.on('ui-refresh', function () {
            updateUi();
        });
        socket.on('disconnect', function () {
            ev.emit('endsocket', socket.client.id, socket.request.connection.remoteAddress);
        });
        socket.on('ui-audio', function (audioStatus) {
            ev.emit('audiostatus', audioStatus, socket.client.id, socket.request.connection.remoteAddress);
        });
        socket.on('ui-params', function (p) {
            delete p.socketid;
            params = p;
        });
        socket.on('join', function (room) {
            socket.join(room);
        });
        socket.on('leave', function (room) {
            socket.leave(room);
        });
    });
}

var updateUiPending = false;
function updateUi(to) {
    if (!to) {
        if (updateUiPending) {
            return;
        }
        updateUiPending = true;
        to = io;
    }
    process.nextTick(function () {
        // menu.forEach(function (o) {
        //     o.theme = baseConfiguration.theme;
        // });
        to.emit('ui-controls', {
            site: baseConfiguration.site,
            // theme: baseConfiguration.theme,
            menu: menu,
            globals: globals,
        });
        updateUiPending = false;
    });
}

function find(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}

function itemSorter(item1, item2) {
    let result;

    item1 = item1.order.toString().split('.');
    item2 = item2.order.toString().split('.');

    while (item1.length) {
        result = item1.shift() - (item2.shift() || 0);

        if (result) {
            return result;
        }
    }

    return -item2.length;
}

function needsUpdate(current, incoming) {
    return (
        current.title !== incoming.config.name ||
        current.icon !== incoming.config.icon ||
        current.disabled !== incoming.config.disabled ||
        current.hidden !== incoming.config.hidden
    );
}

// helper function for searching the menu for folders
function findFolderById(container, id) {
    var result = null;

    if (container instanceof Array) {
        for (var i = 0; i < container.length; i++) {
            result = findFolderById(container[i], id);
            if (result) {
                break;
            }
        }
    } else {
        if (
            (container.hasOwnProperty('isPage') && container.isPage) ||
            (container.hasOwnProperty('link') && container.link.length)
        ) {
            return result;
        } else if (container instanceof Object && container.hasOwnProperty('id') && container.id === id) {
            result = container;
        } else {
            result = findFolderById(container.items, id);
        }
    }
    return result;
}

// helper function to detect changes in multi page
// NB: limitations of using JSON.stringify:
//      1. 'undefined' values will be replaced as 'null'
//      2. JSON.stringify does not consider object types
let multiPagesNeedUpdate = function (current, incoming) {
    return JSON.stringify(current) !== JSON.stringify(incoming);
};

let removeFunc;
var multiPages = {};
var multiGroups = {};
var multiTabs = {};
var multiWidgets = {};

function addControl(folders, page, group, tab, control) {
    // let removeInheritedPages;

    if (group.id.includes('inh')) {
        console.log('INHERITED!!!!!!');
    }
    // if (control.label === 'button1') {
    //     console.log('folders: ', folders);
    //     console.log('page: ', page);
    //     console.log('group: ', group);
    //     console.log('tab: ', tab);
    //     console.log('control: ', control);
    // }

    if (typeof control.type !== 'string' || !folders.length || !page || !group || !tab) {
        return function () {};
    }

    // global template?
    if (control.type === 'template' && control.templateScope === 'global') {
        // add content to globals
        globals.push(control);
        updateUi();

        // return remove function
        return function () {
            var index = globals.indexOf(control);
            if (index >= 0) {
                globals.splice(index, 1);
                updateUi();
            }
        };
    } else {
        // group = group || settings.defaultGroupHeader;
        // control.order = parseFloat(control.order);
        control.order = control.order;
        let pathNeedsUpdate = false;
        var foundFolder;

        var foldersStack = [...folders];
        var foldersPath = '';

        let parent = null;
        let isRoot;
        let currFolder;

        while (foldersStack.length > 0) {
            isRoot = foldersStack.length === folders.length;
            currFolder = foldersStack.pop();
            foldersPath += currFolder.config.pathName + '/';

            if (isRoot) {
                foundFolder = find(menu, function (f) {
                    return f.id === currFolder.id;
                });
            } else {
                parent = findFolderById(menu, currFolder.config.folder);
                foundFolder = find(parent.items, function (f) {
                    return f.id === currFolder.id;
                });
            }

            if (!foundFolder) {
                foundFolder = {
                    id: currFolder.id,
                    isRoot: isRoot,
                    // order: parseFloat(currFolder.config.order),
                    order: currFolder.config.order,
                    disabled: currFolder.config.disabled,
                    hidden: currFolder.config.hidden,
                    items: [],
                    // Atrio sidebarItems properties:
                    path: '',
                    title: currFolder.config.name,
                    icon: currFolder.config.icon,
                    class: isRoot ? 'menu-toggle' : 'ml-sub-menu',
                    groupTitle: false,
                    submenu: [],
                };

                if (parent) {
                    parent.items.push(foundFolder);
                    parent.submenu.push(foundFolder);
                    parent.items.sort(itemSorter);
                    parent.submenu.sort(itemSorter);
                } else {
                    menu.push(foundFolder);
                    menu.sort(itemSorter);
                }
            }

            if (foundFolder && needsUpdate(foundFolder, currFolder)) {
                var updatedFolder = {
                    id: currFolder.id,
                    isRoot: currFolder.isRoot,
                    // order: parseFloat(currFolder.config.order),
                    order: currFolder.config.order,
                    disabled: currFolder.config.disabled,
                    hidden: currFolder.config.hidden,
                    items: foundFolder.items,
                    // Atrio sidebarItems properties:
                    path: '',
                    title: currFolder.config.name,
                    icon: currFolder.config.icon,
                    class: foundFolder.class,
                    groupTitle: foundFolder.groupTitle,
                    submenu: foundFolder.submenu,
                };

                if (parent) {
                    parent.items.splice(parent.items.indexOf(foundFolder), 1, updatedFolder);
                    parent.submenu.splice(parent.items.indexOf(foundFolder), 1, updatedFolder);
                } else {
                    menu.splice(menu.indexOf(foundFolder), 1, updatedFolder);
                }
                foundFolder = updatedFolder;
                pathNeedsUpdate = true;
            }
        }

        // console.log('page: ', page);

        if (page.config.pageType === 'inherited') {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }

        if (page.config.pageType === 'multi' || page.config.isMulti) {
            if (inheritedPages.hasOwnProperty(page.id)) {
                console.log('inheritedPages: ', inheritedPages);
                console.log('control: ', control);
                inheritedPages[page.id].forEach((inhPage, index) => {
                    // let inhPage = inheritedPages[page.id]; // TODO: This should be an array!

                    // inherit groups, tabs, & control
                    let inhGroup = updateAndClone(group, {
                        id: group.id + '.inh.' + index,
                        config: { ...group.config, page: inhPage.id },
                    });

                    let inhTab = updateAndClone(tab, {
                        id: tab.id + '.inh.' + index,
                        config: { ...tab.config, group: inhGroup.id },
                    });

                    let inhCtrl = updateAndClone(control, { id: control.id + '.inh.' + index });

                    if (!inhPage.removes) {
                        inhPage.removes = {};
                    }

                    inhPage.removes[control.id] = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                    // inhPage.remove = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                    // removeInheritedPages = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                });
                console.log('inheritedPages: ', inheritedPages);
            }

            // get expression from page
            let expression = page.config.expression;

            // split string as prefix and instance nums
            let rx = /^(.*)(\{x\})(.*)$/gi;

            let expressionArr = rx.exec(expression);
            // expressionArr[0]: input text (expression)
            // expressionArr[1]: first group (prefix)
            // expressionArr[2]: second group (instance num)
            // expressionArr[3]: third group (suffix)

            if (!expressionArr) {
                throw new Error("Please check multi page's Instance Name Expression");
            }

            // set prefix & suffix
            let pageTitlePrefix = expressionArr[1];
            let pageTitleSuffix = expressionArr[3];

            // determine instance properties
            let instanceNames = [];
            let instanceParams = [];
            let instanceIds = [];
            let firstParamVar = '';

            let instances = page.config.instances;

            instances.forEach((instance) => {
                if (instance.names && instance.param) {
                    instanceNames = instanceNames.concat(instance.names._arr);
                    instanceParams = instanceParams.concat(instance.param._arr);
                    firstParamVar = instance.param.input[0].variable; // grab first variable to be used in the IDs
                    instance.param._arr.forEach((p) => {
                        instanceIds.push(firstParamVar + p[firstParamVar]);
                    });
                }
            });

            let incomingSettings = {
                instanceNames,
                instanceParams,
                pageTitle: {
                    pageTitlePrefix,
                    pageTitleSuffix,
                },
            };

            if (
                multiPages.hasOwnProperty(page.id) &&
                (multiPagesNeedUpdate(multiPages[page.id], incomingSettings) || pathNeedsUpdate)
            ) {
                foundFolder.items = foundFolder.items.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                foundFolder.submenu = foundFolder.submenu.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                delete multiPages[page.id];
                multiTabs = {};
                multiGroups = {};
                multiWidgets = {};

                pathNeedsUpdate = false;
            }

            // check to see if multi page has already been exploded && injected
            if (multiPages.hasOwnProperty(page.id)) {
                foundFolder.items.forEach((p) => {
                    if (p.id.startsWith(page.id)) {
                        if (multiGroups[group.id]) {
                            p.items.forEach((g) => {
                                if (g.id.startsWith(group.id)) {
                                    g.header = group.config.name;
                                    g.order = group.config.order;
                                    g.widthLg = group.config.widthLg;
                                    g.widthMd = group.config.widthMd;
                                    g.widthSm = group.config.widthSm;
                                    g.disp = group.config.disp;

                                    if (multiTabs[tab.id]) {
                                        g.items.forEach((t) => {
                                            if (t.id.startsWith(tab.id)) {
                                                t.header = tab.config.name;
                                                t.order = tab.config.order;

                                                if (multiWidgets[control.id]) {
                                                    t.items.forEach((w) => {
                                                        if (w.id.startsWith(control.id)) {
                                                            // control.instance = p.instance;
                                                            let newCtrlId = control.id + '.' + p.instance._id;
                                                            w = { ...control, 'id': newCtrlId, 'instance': p.instance };
                                                        }
                                                    });
                                                } else {
                                                    // control.instance = p.instance;
                                                    let newCtrlId = control.id + '.' + p.instance._id;
                                                    t.items.push({
                                                        ...control,
                                                        'id': newCtrlId,
                                                        'instance': p.instance,
                                                    });
                                                    t.items.sort(itemSorter);
                                                }
                                            }
                                        });
                                    } else {
                                        let instanceTab = {
                                            id: tab.id + '.' + p.instance._id,
                                            header: tab.config.name,
                                            order: tab.config.order,
                                            items: [],
                                        };

                                        // control.instance = p.instance;
                                        let newCtrlId = control.id + '.' + p.instance._id;
                                        instanceTab.items.push({ ...control, 'id': newCtrlId, 'instance': p.instance });

                                        g.items.push(instanceTab);
                                        g.items.sort(itemSorter);
                                    }
                                }
                            });
                        } else {
                            let instanceGroup = {
                                id: group.id + '.' + p.instance._id,
                                header: group.config.name,
                                order: group.config.order,
                                widthLg: group.config.widthLg,
                                widthMd: group.config.widthMd,
                                widthSm: group.config.widthSm,
                                items: [],
                                disp: group.config.disp,
                            };

                            let instanceTab = {
                                id: tab.id + '.' + p.instance._id,
                                header: tab.config.name,
                                order: tab.config.order,
                                items: [],
                            };

                            // control.instance = p.instance;
                            let newCtrlId = control.id + '.' + p.instance._id;
                            instanceTab.items.push({ ...control, 'id': newCtrlId, 'instance': p.instance });

                            instanceGroup.items.push(instanceTab);

                            p.items.push(instanceGroup);
                            p.items.sort(itemSorter);
                        }
                    }
                });
                foundFolder.items.sort(itemSorter);
                foundFolder.submenu.sort(itemSorter);

                multiTabs[tab.id] = true;
                multiGroups[group.id] = true;
                multiWidgets[control.id] = true;
            } else {
                foundFolder.items = foundFolder.items.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                foundFolder.submenu = foundFolder.submenu.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                for (let i = 0; i < instanceIds.length; i++) {
                    let pageTitle = pageTitlePrefix + instanceNames[i] + pageTitleSuffix;

                    let instancePage = {
                        id: page.id + '.' + instanceIds[i],
                        isPage: true,
                        order: page.config.order + '.' + i,
                        disabled: page.config.disabled,
                        hidden: page.config.hidden,
                        instance: {
                            'name': instanceNames[i],
                            'parameters': instanceParams[i],
                            '_id': instanceIds[i],
                        },
                        items: [],
                        // Atrio sidebarItems properties:
                        path: '/d/' + foldersPath + pageTitle.replace(/ /g, '').toLowerCase(),
                        title: pageTitle,
                        // icon: page.config.icon,
                        class: 'ml-menu',
                        groupTitle: false,
                        submenu: [],
                    };

                    let instanceGroup = {
                        id: group.id + '.' + instanceIds[i],
                        header: group.config.name,
                        order: group.config.order,
                        widthLg: group.config.widthLg,
                        widthMd: group.config.widthMd,
                        widthSm: group.config.widthSm,
                        items: [],
                        disp: group.config.disp,
                    };

                    let instanceTab = {
                        id: tab.id + '.' + instanceIds[i],
                        header: tab.config.name,
                        order: tab.config.order,
                        items: [],
                    };

                    // control.instance = instancePage.instance;
                    let newCtrlId = control.id + '.' + instanceIds[i];

                    instanceTab.items.push({ ...control, 'id': newCtrlId, 'instance': instancePage.instance });
                    instanceTab.items.sort(itemSorter);

                    instanceGroup.items.push(instanceTab);
                    instanceGroup.items.sort(itemSorter);

                    instancePage.items.push(instanceGroup);
                    instancePage.items.sort(itemSorter);

                    foundFolder.items.push(instancePage);
                    foundFolder.submenu.push(instancePage);
                }

                foundFolder.items.sort(itemSorter);
                foundFolder.submenu.sort(itemSorter);

                multiWidgets[control.id] = true;
                multiTabs[tab.id] = true;
                multiGroups[group.id] = true;
                multiPages[page.id] = {
                    instanceNames: [...instanceNames],
                    instanceParams: [...instanceParams],
                    pageTitle: { pageTitlePrefix, pageTitleSuffix },
                };
            }

            function multiRemove() {
                // console.log('multiRemove called by....', page);
                // console.log('inheritedPages: ', inheritedPages);
                if (inheritedPages.hasOwnProperty(page.id)) {
                    inheritedPages[page.id].forEach((inhPage) => {
                        if (inhPage.config.refPage === page.id && inhPage.removes.hasOwnProperty(control.id)) {
                            inhPage.removes[control.id]();
                            delete inhPage.removes[control.id];
                        }
                    });
                    // removeInheritedPages();
                    // delete inheritedPages[page.id];
                }
                // if control is part of a multi page
                if (multiWidgets[control.id]) {
                    // filter foundFolder.items
                    foundFolder.items = foundFolder.items.filter((p) => {
                        // if p is a pseudo-page of page
                        if (p.id.startsWith(page.id)) {
                            // filter p.items
                            p.items = p.items.filter((g) => {
                                // if g is a pseudo-group of group
                                if (g.id.startsWith(group.id)) {
                                    // filter g.items
                                    g.items = g.items.filter((t) => {
                                        // if t is a pseudo-tab of tab
                                        if (t.id.startsWith(tab.id)) {
                                            t.items = t.items.filter((w) => !w.id.startsWith(control.id));
                                        }

                                        // cleanup multiTabs dictionary
                                        if (t.items.length === 0) {
                                            delete multiTabs[tab.id];
                                        }

                                        return t.items.length > 0;
                                    });

                                    // cleanup multiGroups dictionary
                                    if (g.items.length === 0) {
                                        delete multiGroups[group.id];
                                    }
                                }
                                // filter out childless groups from p.items
                                return g.items.length > 0;
                            });

                            // filter foundFolder.submenu to match foundFolder.items
                            if (p.items.length === 0) {
                                foundFolder.submenu = foundFolder.submenu.filter((item) => item.id !== p.id);

                                // clean-up multiPages dict
                                delete multiPages[page.id];

                                // if a inherited page clean-up inheritedPages dict
                                if (
                                    page.config.pageType === 'inherited' &&
                                    inheritedPages.hasOwnProperty(page.config.refPage)
                                ) {
                                    // removeInheritedPages();
                                    // console.log('inheritedPages: ', inheritedPages);
                                    inheritedPages[page.config.refPage] = inheritedPages[page.config.refPage].filter(
                                        (inhPage) => inhPage.id !== page.id
                                    );
                                    // console.log('inheritedPages: ', inheritedPages);

                                    if (inheritedPages[page.config.refPage].length === 0) {
                                        delete inheritedPages[page.config.refPage];
                                    }
                                    // console.log('inheritedPages: ', inheritedPages);
                                }
                            }
                        }

                        // filter out childless pages from foundFolder.items
                        return p.items.length > 0;
                    });

                    // if foundFolder is now childless
                    if (foundFolder.items.length === 0 && foundFolder.submenu.length === 0) {
                        cleanupChildlessFolders(foundFolder, folders);

                        // // grab a copy of folders stack
                        // let foldersStack = [...folders];
                        // let curr = foldersStack.find((f) => f.id === foundFolder.id);

                        // // travel up the menu tree and remove childless folders
                        // do {
                        //     let parent = findFolderById(menu, curr.config.folder);
                        //     let currInMenu = findFolderById(menu, curr.id);
                        //     if (parent) {
                        //         if (currInMenu.items.length === 0 && currInMenu.submenu.length === 0) {
                        //             parent.items = parent.items.filter((item) => item.id !== currInMenu.id);
                        //             parent.submenu = parent.submenu.filter((item) => item.id !== currInMenu.id);
                        //         }
                        //         curr = foldersStack.find((f) => f.id === parent.id);
                        //     } else {
                        //         menu = menu.filter((item) => item.id !== curr.id);
                        //         curr = null;
                        //     }
                        // } while (curr);
                    }
                    delete multiWidgets[control.id];
                    updateUi();
                }
            }

            removeFunc = multiRemove;

            // save a copy of the variable name used in instance IDs
            control['_idVar'] = firstParamVar;
        } else if (page.config.pageType === 'single' || page.config.isSingle) {
            if (inheritedPages.hasOwnProperty(page.id)) {
                inheritedPages[page.id].forEach((inhPage, index) => {
                    // let inhPage = inheritedPages[page.id]; // TODO: This should be an array!

                    // inherit groups, tabs, & control
                    let inhGroup = updateAndClone(group, {
                        id: group.id + '.inh.' + index,
                        config: { ...group.config, page: inhPage.id },
                    });

                    let inhTab = updateAndClone(tab, {
                        id: tab.id + '.inh.' + index,
                        config: { ...tab.config, group: inhGroup.id },
                    });

                    let inhCtrl = updateAndClone(control, { id: control.id + '.inh.' + index });

                    // console.log('inhPage: ', inhPage);
                    // console.log('inhGroup: ', inhGroup);
                    // console.log('inhTab: ', inhTab);
                    // console.log('inhCtrl: ', inhCtrl);

                    if (!inhPage.removes) {
                        inhPage.removes = {};
                    }

                    inhPage.removes[control.id] = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                    // inhPage.remove = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                    // removeInheritedPages = addControl(inhPage.folders, inhPage, inhGroup, inhTab, inhCtrl);
                });
            }

            if (multiPages.hasOwnProperty(page.id)) {
                foundFolder.items = foundFolder.items.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                foundFolder.submenu = foundFolder.submenu.filter(function (p) {
                    return !p.id.startsWith(page.id);
                });

                delete multiPages[page.id];
            }
            delete multiGroups[group.id];
            delete multiWidgets[control.id];

            var foundPage = find(foundFolder.items, function (p) {
                return p.id === page.id;
            });

            if (foundPage && (pathNeedsUpdate || needsUpdate(foundPage, page))) {
                var updatedPage = {
                    id: page.id,
                    isPage: true,
                    // order: updatedOrder,
                    // order: parseFloat(page.config.order),
                    order: page.config.order,
                    disabled: page.config.disabled,
                    hidden: page.config.hidden,
                    items: foundPage.items,
                    // Atrio sidebarItems properties:
                    path: '/d/' + foldersPath + page.config.pathName,
                    title: page.config.name,
                    // icon: page.config.icon,
                    class: foundPage.class,
                    groupTitle: foundPage.groupTitle,
                    submenu: foundPage.submenu,
                };

                foundFolder.items.splice(foundFolder.items.indexOf(foundPage), 1, updatedPage);
                foundFolder.submenu.splice(foundFolder.submenu.indexOf(foundPage), 1, updatedPage);
                foundPage = updatedPage;
                pathNeedsUpdate = false;
            }

            if (!foundPage) {
                foundPage = {
                    id: page.id,
                    isPage: true,
                    // order: parseFloat(page.config.order),
                    order: page.config.order,
                    disabled: page.config.disabled,
                    hidden: page.config.hidden,
                    items: [],
                    // Atrio sidebarItems properties:
                    path: '/d/' + foldersPath + page.config.pathName,
                    title: page.config.name,
                    // icon: page.config.icon,
                    class: 'ml-menu',
                    groupTitle: false,
                    submenu: [],
                };

                foundFolder.items.push(foundPage);
                foundFolder.submenu.push(foundPage);
            }

            var foundGroup = find(foundPage.items, function (g) {
                return g.header === group.config.name;
            });
            if (!foundGroup) {
                foundGroup = {
                    id: group.id,
                    header: group.config.name,
                    order: group.config.order,
                    widthLg: group.config.widthLg,
                    widthMd: group.config.widthMd,
                    widthSm: group.config.widthSm,
                    items: [],
                    disp: group.config.disp,
                };
                foundPage.items.push(foundGroup);
            }

            var foundTab = find(foundGroup.items, function (t) {
                return t.header === tab.config.name;
            });
            if (!foundTab) {
                foundTab = {
                    id: tab.id,
                    header: tab.config.name,
                    order: tab.config.order,
                    items: [],
                };
                foundGroup.items.push(foundTab);
            }

            foundTab.items.push(control);
            foundTab.items.sort(itemSorter);

            foundTab.order = tab.config.order;
            foundGroup.items.sort(itemSorter);
            foundPage.items.sort(itemSorter);
            foundFolder.items.sort(itemSorter);
            foundFolder.submenu.sort(itemSorter);

            function singleRemove() {
                // if (control.id.includes('inh')) {
                // console.log('singleRemove called by control.id: ', control.id, ' and page.id: ', page.id);
                // }
                if (inheritedPages.hasOwnProperty(page.id)) {
                    // console.log('inheritedPages: ', inheritedPages);
                    inheritedPages[page.id].forEach((inhPage) => {
                        // console.log('inhPage: ', inhPage);
                        if (inhPage.config.refPage === page.id && inhPage.removes.hasOwnProperty(control.id)) {
                            // console.log('inhPage.remove being called by inhPage: ', inhPage);
                            // inhPage.remove();
                            inhPage.removes[control.id]();
                            delete inhPage.removes[control.id];
                        }
                    });
                    // removeInheritedPages();
                    // delete inheritedPages[page.id];
                }

                var index = foundTab.items.indexOf(control);
                // if (control.id.includes('inh')) {
                //     console.log('foundTab: ', foundTab);
                //     console.log('index: ', index);
                // }

                if (index >= 0) {
                    // Remove the item from the tab
                    foundTab.items.splice(index, 1);

                    // If the tab is now empty, remove it from the group
                    if (foundTab.items.length === 0) {
                        index = foundGroup.items.indexOf(foundTab);

                        if (index >= 0) {
                            foundGroup.items.splice(index, 1);

                            // If the group is now empty, remove it from the page
                            if (foundGroup.items.length === 0) {
                                index = foundPage.items.indexOf(foundGroup);

                                if (index >= 0) {
                                    foundPage.items.splice(index, 1);

                                    // If the page is now empty, remove it from the folder
                                    if (foundPage.items.length === 0) {
                                        // if a inherited page clean-up inheritedPages dict
                                        if (
                                            page.config.pageType === 'inherited' &&
                                            inheritedPages.hasOwnProperty(page.config.refPage)
                                        ) {
                                            // removeInheritedPages();
                                            // console.log('inheritedPages: ', inheritedPages);
                                            inheritedPages[page.config.refPage] = inheritedPages[
                                                page.config.refPage
                                            ].filter((inhPage) => inhPage.id !== page.id);
                                            // console.log('inheritedPages: ', inheritedPages);

                                            if (inheritedPages[page.config.refPage].length === 0) {
                                                delete inheritedPages[page.config.refPage];
                                            }
                                            // console.log('inheritedPages: ', inheritedPages);
                                        }
                                        itemsIdx = foundFolder.items.indexOf(foundPage);
                                        submenuIdx = foundFolder.submenu.indexOf(foundPage);

                                        if (itemsIdx >= 0 && submenuIdx >= 0) {
                                            foundFolder.items.splice(itemsIdx, 1);
                                            foundFolder.submenu.splice(submenuIdx, 1);

                                            // If the folder is now empty, find parent, remove self and check whether parent should be removed
                                            if (foundFolder.items.length === 0) {
                                                cleanupChildlessFolders(foundFolder, folders);
                                                // let foldersStack = [...folders];
                                                // let curr = foldersStack.find((f) => f.id === foundFolder.id);

                                                // do {
                                                //     let parent = findFolderById(menu, curr.config.folder);
                                                //     let currInMenu = findFolderById(menu, curr.id);
                                                //     if (parent) {
                                                //         if (
                                                //             currInMenu.items.length === 0 &&
                                                //             currInMenu.submenu.length === 0
                                                //         ) {
                                                //             parent.items = parent.items.filter(
                                                //                 (item) => item.id !== currInMenu.id
                                                //             );
                                                //             parent.submenu = parent.submenu.filter(
                                                //                 (item) => item.id !== currInMenu.id
                                                //             );
                                                //         }
                                                //         curr = foldersStack.find((f) => f.id === parent.id);
                                                //     } else {
                                                //         menu = menu.filter((item) => item.id !== curr.id);
                                                //         curr = null;
                                                //     }
                                                // } while (curr);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    updateUi();
                }
            }

            removeFunc = singleRemove;
        }

        updateUi();

        return removeFunc;
    }
}

function addInheritedPage(RED, page) {
    // let control/widgets handle remove
    let remove = function () {};

    if (page.config.refPage === 'none' || page.config.pageType !== 'inherited') {
        return remove;
    }

    let { _tab, _group, _page, folders } = makeMenuTree(RED, page.config);

    // console.log('page: ', page);
    let refPage = RED.nodes.getNode(page.config.refPage);
    // console.log('refPage: ', refPage);

    let inhConfig = {
        id: page.id,
        name: page.name,
        folders,
        config: {
            // ...inhPage.config,
            ...refPage.config,
            id: page.id,
            name: page.config.name,
            pathName: page.config.pathName,
            folder: page.config.folder,
            pageType: page.config.pageType,
            refPage: page.config.refPage,
            order: page.config.order,
            width: page.config.width,
            disabled: page.config.disabled,
            hidden: page.config.hidden,
            expression: page.config.inheritInst ? refPage.config.expression : page.config.expression,
            instances: page.config.inheritInst ? refPage.config.instances : page.config.instances,
        },
    };

    let inhPage = updateAndClone(refPage, inhConfig);

    // console.log('inheritedPages: ', inheritedPages);
    if (inheritedPages.hasOwnProperty(refPage.id)) {
        inheritedPages[refPage.id].push(inhPage);
    } else {
        inheritedPages[refPage.id] = [inhPage];
    }
    // console.log('inheritedPages: ', inheritedPages);

    // inheritedPages[refPage.id] = inhPage;

    return remove;
}

function addLink(id, title, folders, link, icon, order, target) {
    // Do not add dead links
    if (!link || !link.length) {
        return () => {};
    }

    let newLink = {
        id,
        title,
        link,
        icon,
        order: order || 1,
        target,
        submenu: [],
    };

    let foldersStack = [...folders];
    let parent = null;
    let isRoot;
    let foundFolder;
    let currFolder;

    while (foldersStack.length > 0) {
        isRoot = foldersStack.length === folders.length;
        currFolder = foldersStack.pop();

        if (isRoot) {
            foundFolder = find(menu, function (f) {
                return f.id === currFolder.id;
            });
        } else {
            parent = findFolderById(menu, currFolder.config.folder);
            foundFolder = find(parent.items, function (f) {
                return f.id === currFolder.id;
            });
        }

        if (!foundFolder) {
            foundFolder = {
                id: currFolder.id,
                isRoot: isRoot,
                // order: parseFloat(currFolder.config.order),
                order: currFolder.config.order,
                disabled: currFolder.config.disabled,
                hidden: currFolder.config.hidden,
                items: [],
                // Atrio sidebarItems properties:
                path: '',
                title: currFolder.config.name,
                icon: currFolder.config.icon,
                class: isRoot ? 'menu-toggle' : 'ml-sub-menu',
                groupTitle: false,
                submenu: [],
            };

            if (parent) {
                parent.items.push(foundFolder);
                parent.submenu.push(foundFolder);
                parent.items.sort(itemSorter);
                parent.submenu.sort(itemSorter);
            } else {
                menu.push(foundFolder);
                menu.sort(itemSorter);
            }
        }
    }

    if (foundFolder) {
        foundFolder.items.push(newLink);
        foundFolder.submenu.push(newLink);

        foundFolder.items.sort(itemSorter);
        foundFolder.submenu.sort(itemSorter);

        updateUi();
    } else {
        menu.push(newLink);
        menu.sort(itemSorter);
        updateUi();
    }

    let removeLink = foundFolder
        ? function () {
              foundFolder.items = foundFolder.items.filter((item) => {
                  return item.id !== newLink.id;
              });

              foundFolder.submenu = foundFolder.submenu.filter((item) => {
                  return item.id !== newLink.id;
              });

              if (foundFolder.items.length === 0 && foundFolder.submenu.length === 0) {
                  cleanupChildlessFolders(foundFolder, folders);
              }
              updateUi();
          }
        : function () {
              let index = menu.indexOf(newLink);
              if (index < 0) {
                  return;
              }
              menu.splice(index, 1);
              updateUi();
          };

    return removeLink;
}

function updateAndClone(source, update) {
    if (!source || !update) {
        return {};
    }

    let clone = require('lodash.clone');
    let updatedClone = clone(source);
    Object.assign(updatedClone, update);
    return updatedClone;
}

function cleanupChildlessFolders(found, foldersArr) {
    let stack = [...foldersArr];
    let curr = stack.shift();

    do {
        let parent = findFolderById(menu, curr.config.folder);

        if (parent) {
            let currInMenu = findFolderById(parent.items, curr.id);
            if (currInMenu.items.length === 0 && currInMenu.submenu.length === 0) {
                parent.items = parent.items.filter((i) => i.id !== currInMenu.id);
                parent.submenu = parent.submenu.filter((i) => i.id !== currInMenu.id);
            }
            curr = stack.shift();
        } else {
            menu = menu.filter((i) => i.id !== curr.id);
        }
    } while (stack.length);
}

function addBaseConfig(config) {
    if (config) {
        baseConfiguration = config;
    }
    mani.name = config.site ? config.site.name : 'Unified-RED Dashboard';
    mani.short_name = mani.name.replace('Unified-RED', '').trim();
    // mani.background_color = config.theme.themeState['page-titlebar-backgroundColor'].value;
    // mani.theme_color = config.theme.themeState['page-titlebar-backgroundColor'].value;
    updateUi();
}

// Helper Functions for nodes

function makeMenuTree(RED, config) {
    let tab = config.tab ? RED.nodes.getNode(config.tab) : null;
    let group = config.group || null;
    let page = config.page || null;
    let folder = config.folder || null;

    // if (config.hasOwnProperty('tab')) {
    //     tab = RED.nodes.getNode(config.tab);
    // }

    if (tab) {
        group = RED.nodes.getNode(tab.config.group);
    }

    if (group) {
        page = RED.nodes.getNode(group.config.page);
    }

    if (page) {
        folder = RED.nodes.getNode(page.config.folder);
    }

    // folder tree stack (First In Last Out)
    let folders = [];
    if (folder) {
        if (!folder.hasOwnProperty('config')) {
            folder = RED.nodes.getNode(folder);
        }

        folders.push(folder);

        while (folder.config && folder.config.folder) {
            folder = RED.nodes.getNode(folder.config.folder);
            folders.push(folder);
        }
    }

    return { tab, group, page, folders };
}
