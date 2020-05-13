var inited = false;

module.exports = function (RED) {
  if (!inited) {
    init(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
    inited = true;
  }
  return {
    add: add,
    addLink: addLink,
    addBaseConfig: addBaseConfig,
    emit: emit,
    emitSocket: emitSocket,
    toNumber: toNumber.bind(null, false),
    toFloat: toNumber.bind(null, true),
    updateUi: updateUi,
    ev: ev,
  };
};

var fs = require("fs");
var path = require("path");
var events = require("events");
var socketio = require("socket.io");
var serveStatic = require("serve-static");
var compression = require("compression");

// Unified API requires
const jwt = require('./api/jwt');
const errorHandler = require('./api/error-handler');

var urVersion = require("./package.json").version;
var baseConfiguration = {};
var io;
var menu = [];
var globals = [];
var settings = {};
var updateValueEventName = "update-value";
var currentValues = {};
var replayMessages = {};
var removeStateTimers = {};
var removeStateTimeout = 1000;
var ev = new events.EventEmitter();
var params = {};
ev.setMaxListeners(0);

// default manifest.json to be returned as required.
var mani = {
  name: "unified-RED Dashboard",
  short_name: "Dashboard",
  description: "A dashboard for Node-RED",
  start_url: "./#/0",
  background_color: "#910000",
  theme_color: "#910000",
  display: "standalone",
  icons: [
    { src: "icon192x192.png", sizes: "192x192", type: "image/png" },
    { src: "icon120x120.png", sizes: "120x120", type: "image/png" },
    { src: "icon64x64.png", sizes: "64x64", type: "image/png" },
  ],
};

function toNumber(keepDecimals, config, input, old, m, s) {
  if (input === undefined) {
    return;
  }
  if (typeof input !== "number") {
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
  console.log("ui.js emitSocket called event: ", event);
  console.log("ui.js emitSocket called data: ", data);
  if (
    data.hasOwnProperty("msg") &&
    data.msg.hasOwnProperty("socketid") &&
    data.msg.socketid !== undefined
  ) {
    io.to(data.msg.socketid).emit(event, data);
  } else if (data.hasOwnProperty("socketid") && data.socketid !== undefined) {
    io.to(data.socketid).emit(event, data);
  } else {
    io.emit(event, data);
  }
}

function noConvert(value) {
  return value;
}

function beforeEmit(msg, value) {
  return { value: value };
}

function beforeSend(msg) {
  //do nothing
}

/* This is the handler for inbound msg from previous nodes...
options:
  node - the node that represents the control on a flow
  control - the control to be added
  tab - tab config node that this control belongs to
  group - group name
  [emitOnlyNewValues] - boolean (default true).
      If true, it checks if the payload changed before sending it
      to the front-end. If the payload is the same no message is sent.
  [forwardInputMessages] - boolean (default true).
      If true, forwards input messages to the output
  [storeFrontEndInputAsState] - boolean (default true).
      If true, any message received from front-end is stored as state
  [persistantFrontEndValue] - boolean (default true).
      If true, last received message is send again when front end reconnect.

  [convert] - callback to convert the value before sending it to the front-end
  [beforeEmit] - callback to prepare the message that is emitted to the front-end

  [convertBack] - callback to convert the message from front-end before sending it to the next connected node
  [beforeSend] - callback to prepare the message that is sent to the output
*/
function add(opt) {
  console.log("add called by: ", add.caller);
  console.log("add called with opt: ", opt);
  clearTimeout(removeStateTimers[opt.node.id]);
  delete removeStateTimers[opt.node.id];

  if (typeof opt.emitOnlyNewValues === "undefined") {
    opt.emitOnlyNewValues = true;
  }
  if (typeof opt.forwardInputMessages === "undefined") {
    opt.forwardInputMessages = true;
  }
  if (typeof opt.storeFrontEndInputAsState === "undefined") {
    opt.storeFrontEndInputAsState = true;
  }
  if (typeof opt.persistantFrontEndValue === "undefined") {
    opt.persistantFrontEndValue = true;
  }
  opt.convert = opt.convert || noConvert;
  opt.beforeEmit = opt.beforeEmit || beforeEmit;
  opt.convertBack = opt.convertBack || noConvert;
  opt.beforeSend = opt.beforeSend || beforeSend;
  opt.control.id = opt.node.id;
  var remove = addControl(opt.tab, opt.subtab, opt.group, opt.control);

  opt.node.on("input", function (msg) {
    console.log("opt.node.on input: ", msg);
    if (typeof msg.enabled === "boolean") {
      var state = replayMessages[opt.node.id];
      if (!state) {
        replayMessages[opt.node.id] = state = { id: opt.node.id };
      }
      state.disabled = !msg.enabled;
      io.emit(updateValueEventName, state); // dcj mu
    }

    // remove res and req as they are often circular
    if (msg.hasOwnProperty("res")) {
      delete msg.res;
    }
    if (msg.hasOwnProperty("req")) {
      delete msg.req;
    }

    // Retrieve the dataset for this node
    var oldValue = currentValues[opt.node.id];

    // let any arriving msg.ui_control message mess with control parameters
    if (
      msg.ui_control &&
      typeof msg.ui_control === "object" &&
      !Array.isArray(msg.ui_control) &&
      !Buffer.isBuffer(msg.ui_control)
    ) {
      var changed = {};
      for (var property in msg.ui_control) {
        if (
          msg.ui_control.hasOwnProperty(property) &&
          opt.control.hasOwnProperty(property)
        ) {
          if (
            property !== "id" &&
            property !== "type" &&
            property !== "order" &&
            property !== "name" &&
            property !== "value" &&
            property !== "label" &&
            property !== "width" &&
            property !== "height"
          ) {
            opt.control[property] = msg.ui_control[property];
            changed[property] = msg.ui_control[property];
          }
        }
      }
      if (Object.keys(changed).length !== 0) {
        io.emit("ui-control", { control: changed, id: opt.node.id });
      }
      if (!msg.hasOwnProperty("payload")) {
        return;
      }
    }

    // Call the convert function in the node to get the new value
    // as well as the full dataset.
    var conversion = opt.convert(msg.payload, oldValue, msg, opt.control.step);

    // If the update flag is set, emit the newPoint, and store the full dataset
    var fullDataset;
    var newPoint;
    if (typeof conversion === "object" && conversion.update !== undefined) {
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
    if (
      newPoint !== undefined ||
      !opt.emitOnlyNewValues ||
      oldValue != fullDataset
    ) {
      currentValues[opt.node.id] = fullDataset;

      // Determine what to emit over the websocket
      // (the new point or the full dataset).

      // Always store the full dataset.
      var toStore = opt.beforeEmit(msg, fullDataset);
      var toEmit;
      if (newPoint !== undefined && typeof newPoint !== "boolean") {
        toEmit = opt.beforeEmit(msg, newPoint);
      } else {
        toEmit = toStore;
      }

      var addField = function (m) {
        if (
          opt.control.hasOwnProperty(m) &&
          opt.control[m] &&
          opt.control[m].indexOf("{{") !== -1
        ) {
          var a = opt.control[m].split("{{");
          a.shift();
          for (var i = 0; i < a.length; i++) {
            var b = a[i].split("}}")[0].trim();
            b.replace(/\"/g, "").replace(/\'/g, "");
            if (b.indexOf("|") !== -1) {
              b = b.split("|")[0];
            }
            if (b.indexOf(" ") !== -1) {
              b = b.split(" ")[0];
            }
            if (b.indexOf("?") !== -1) {
              b = b.split("?")[0];
            }
            b.replace(/\(/g, "").replace(/\)/g, "");
            if (b.indexOf("msg.") >= 0) {
              b = b.split("msg.")[1];
              if (b.indexOf(".") !== -1) {
                b = b.split(".")[0];
              }
              if (b.indexOf("[") !== -1) {
                b = b.split("[")[0];
              }
              if (!toEmit.hasOwnProperty("msg")) {
                toEmit.msg = {};
              }
              if (
                !toEmit.msg.hasOwnProperty(b) &&
                msg.hasOwnProperty(b) &&
                msg[b] !== undefined
              ) {
                if (Buffer.isBuffer(msg[b])) {
                  toEmit.msg[b] = msg[b].toString("binary");
                } else {
                  toEmit.msg[b] = JSON.parse(JSON.stringify(msg[b]));
                }
              }
            } else {
              if (b.indexOf(".") !== -1) {
                b = b.split(".")[0];
              }
              if (b.indexOf("[") !== -1) {
                b = b.split("[")[0];
              }
              if (!toEmit.hasOwnProperty(b) && msg.hasOwnProperty(b)) {
                if (Buffer.isBuffer(msg[b])) {
                  toEmit[b] = msg[b].toString("binary");
                } else {
                  toEmit[b] = JSON.parse(JSON.stringify(msg[b]));
                }
              }
            }
          }
        }
      };

      // if label, format or color field is set to a msg property, emit that as well
      addField("label");
      addField("format");
      addField("color");
      addField("units");
      if (msg.hasOwnProperty("enabled")) {
        toEmit.disabled = !msg.enabled;
      }
      toEmit.id = toStore.id = opt.node.id;
      //toEmit.socketid = msg.socketid; // dcj mu
      // Emit and Store the data
      //if (settings.verbose) { console.log("UI-EMIT",JSON.stringify(toEmit)); }
      emitSocket(updateValueEventName, toEmit);
      if (opt.persistantFrontEndValue) {
        replayMessages[opt.node.id] = toStore;
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
    if (msg.id !== opt.node.id) {
      return;
    } // ignore if not us
    if (settings.readOnly === true) {
      msg.value = currentValues[msg.id];
    } // don't accept input if we are in read only mode
    else {
      var converted = opt.convertBack(msg.value);
      if (opt.storeFrontEndInputAsState === true) {
        currentValues[msg.id] = converted;
        if (opt.persistantFrontEndValue) {
          replayMessages[msg.id] = msg;
        }
      }
      var toSend = { payload: converted };
      toSend = opt.beforeSend(toSend, msg) || toSend;
      toSend.socketid = toSend.socketid || msg.socketid;
      if (toSend.hasOwnProperty("topic") && toSend.topic === undefined) {
        delete toSend.topic;
      }
      if (!msg.hasOwnProperty("_fromInput")) {
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
  var trimRegex = new RegExp("^\\/|\\/$", "g");
  var paths = Array.prototype.slice.call(arguments);
  return (
    "/" +
    paths
      .map(function (e) {
        if (e) {
          return e.replace(trimRegex, "");
        }
      })
      .filter(function (e) {
        return e;
      })
      .join("/")
  );
}

function init(server, app, log, redSettings) {
  //   console.log(server);
  //   console.log(app);
  //   console.log(log);
  //   console.log(redSettings);
  var uiSettings = redSettings.ui || {};
  if (
    uiSettings.hasOwnProperty("path") &&
    typeof uiSettings.path === "string"
  ) {
    settings.path = uiSettings.path;
  } else {
    settings.path = "ui";
  }
  if (
    uiSettings.hasOwnProperty("readOnly") &&
    typeof uiSettings.readOnly === "boolean"
  ) {
    settings.readOnly = uiSettings.readOnly;
  } else {
    settings.readOnly = false;
  }
  settings.defaultGroupHeader = uiSettings.defaultGroup || "Default";
  settings.verbose = redSettings.verbose || false;

  var fullPath = join(redSettings.httpNodeRoot, settings.path);
  console.log("ui.js 333 fullPath: ", fullPath);
  var socketIoPath = join(fullPath, "socket.io");
  console.log("ui.js 335 socketIoPath: ", socketIoPath);

  io = socketio(server, { path: socketIoPath });
  //   console.log(io);

  var dashboardMiddleware = function (req, res, next) {
    next();
  };

  if (uiSettings.middleware) {
    if (typeof uiSettings.middleware === "function") {
      dashboardMiddleware = uiSettings.middleware;
    }
  }

  fs.stat(path.join(__dirname, "dist/index.html"), function (err, stat) {
    app.use(compression());
    //   console.log('ui.js 349: ' + __dirname);
    if (!err) {
      app.use(join(settings.path, "manifest.json"), function (req, res) {
        res.send(mani);
      });
      //   console.log("serveStatic: ", path.join(__dirname, "dist"));
      app.use(
        join(settings.path),
        dashboardMiddleware,
        serveStatic(path.join(__dirname, "dist"))
      );
    } else {
      log.info("[Dashboard] Dashboard using development folder");
      app.use(
        join(settings.path),
        dashboardMiddleware,
        serveStatic(path.join(__dirname, "src"))
      );
      var vendor_packages = [
        "angular",
        "angular-sanitize",
        "angular-animate",
        "angular-aria",
        "angular-material",
        "angular-touch",
        "angular-material-icons",
        "svg-morpheus",
        "font-awesome",
        "weather-icons-lite",
        "sprintf-js",
        "jquery",
        "jquery-ui",
        "d3",
        "raphael",
        "justgage",
        "angular-chart.js",
        "chart.js",
        "moment",
        "angularjs-color-picker",
        "tinycolor2",
        "less",
      ];
      vendor_packages.forEach(function (packageName) {
        app.use(
          join(settings.path, "vendor", packageName),
          serveStatic(path.join(__dirname, "node_modules", packageName))
        );
      });
    }

    // Define Unified API
    app.use(jwt());
    app.use('/api', require('./api/api.controller'));
    app.use(errorHandler);

  });

  log.info("Dashboard version " + urVersion + " started at " + fullPath);

  io.on("connection", function (socket) {
    //   console.log("ui io.on connection: ", socket);
    ev.emit(
      "newsocket",
      socket.client.id,
      socket.request.connection.remoteAddress
    );
    updateUi(socket);

    socket.on(updateValueEventName, ev.emit.bind(ev, updateValueEventName));
    socket.on("ui-replay-state", function () {
      var ids = Object.getOwnPropertyNames(replayMessages);
      setTimeout(function () {
        ids.forEach(function (id) {
          socket.emit(updateValueEventName, replayMessages[id]);
        });
      }, 50);
      socket.emit("ui-replay-done");
    });
    socket.on("ui-change", function (tabIndex, subtabIndex) {
      var name = "";
      if (
        tabIndex != null &&
        subtabIndex != null &&
        !isNaN(tabIndex) &&
        !isNaN(subtabIndex) &&
        menu.length > 0 &&
        menu[tabIndex].items.length > 0 &&
        tabIndex < menu.length &&
        subtabIndex < menu[tabIndex].items.length &&
        menu[tabIndex] &&
        menu[tabIndex].items[subtabIndex]
      ) {
        name =
          menu[tabIndex].items[subtabIndex].hasOwnProperty("header") &&
          typeof menu[tabIndex].items[subtabIndex].header !== "undefined"
            ? menu[tabIndex].items[subtabIndex].header
            : menu[tabIndex].items[subtabIndex].name;
        ev.emit(
          "changetab",
          index,
          name,
          socket.client.id,
          socket.request.connection.remoteAddress,
          params
        );
      }
    });
    socket.on("ui-refresh", function () {
      updateUi();
    });
    socket.on("disconnect", function () {
      ev.emit(
        "endsocket",
        socket.client.id,
        socket.request.connection.remoteAddress
      );
    });
    socket.on("ui-audio", function (audioStatus) {
      ev.emit(
        "audiostatus",
        audioStatus,
        socket.client.id,
        socket.request.connection.remoteAddress
      );
    });
    socket.on("ui-params", function (p) {
      delete p.socketid;
      params = p;
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
    menu.forEach(function (o) {
      o.theme = baseConfiguration.theme;
    });
    to.emit("ui-controls", {
      site: baseConfiguration.site,
      theme: baseConfiguration.theme,
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
  if (item1.order === 0 && item2.order !== 0) {
    return 1;
  } else if (item1.order !== 0 && item2.order === 0) {
    return -1;
  }
  return item1.order - item2.order;
}

function addControl(tab, subtab, groupHeader, control) {
  if (typeof control.type !== "string") {
    return function () {};
  }

  // global template?
  if (control.type === "template" && control.templateScope === "global") {
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
    groupHeader = groupHeader || settings.defaultGroupHeader;
    control.order = parseFloat(control.order);
    // console.log("tab, groupHeader, control", tab, groupHeader, control);
    // console.log("ui.js 466 menu: ", JSON.stringify(menu, null, '\t'));
    // console.log("menu[0].items: ", menu[0]);
    var foundTab = find(menu, function (t) {
      return t.id === tab.id;
    });
    if (!foundTab) {
      foundTab = {
        id: tab.id,
        header: tab.config.name,
        order: parseFloat(tab.config.order),
        icon: tab.config.icon,
        //icon: tab.config.hidden ? "fa-ban" : tab.config.icon,
        disabled: tab.config.disabled,
        hidden: tab.config.hidden,
        show: false,
        items: [],
      };
      menu.push(foundTab);
      menu.sort(itemSorter);
    }

    var foundSubtab = find(foundTab.items, function (s) {
      return s.id === subtab.id;
    });
    if (!foundSubtab) {
      foundSubtab = {
        id: subtab.id,
        header: subtab.config.name,
        order: parseFloat(subtab.config.order),
        icon: subtab.config.icon,
        disabled: subtab.config.disabled,
        hidden: subtab.config.hidden,
        items: [],
      };
      foundTab.items.push(foundSubtab);
    }

    var foundGroup = find(foundSubtab.items, function (g) {
      return g.header === groupHeader;
    });
    if (!foundGroup) {
      foundGroup = {
        header: groupHeader,
        order: groupHeader.config.order,
        items: [],
      };
      foundSubtab.items.push(foundGroup);
    }
    foundGroup.items.push(control);
    foundGroup.items.sort(itemSorter);
    // foundGroup.order = groupHeader.config.order;
    foundSubtab.items.sort(itemSorter);
    foundTab.items.sort(itemSorter);

    updateUi();

    // Return the remove function for this control
    return function () {
      var index = foundGroup.items.indexOf(control);
      if (index >= 0) {
        // Remove the item from the group
        foundGroup.items.splice(index, 1);

        // If the group is now empty, remove it from the subtab
        if (foundGroup.items.length === 0) {
          index = foundSubtab.items.indexOf(foundGroup);
          if (index >= 0) {
            foundSubtab.items.splice(index, 1);

            // If the subtab is now empty, remove it from the tab
            if (foundSubtab.items.length === 0) {
              index = foundTab.indexOf(foundSubtab);
              if (index >= 0) {
                foundTab.items.splice(index, 1);

                // If the tab is now empty, remove it as well
                if (foundTab.items.length === 0) {
                  index = menu.indexOf(foundTab);
                  if (index >= 0) {
                    menu.splice(index, 1);
                  }
                }
              }
            }
          }
        }
        updateUi();
      }
    };
  }
}

function addLink(name, link, icon, order, target) {
  var newLink = {
    name: name,
    link: link,
    icon: icon,
    order: order || 1,
    target: target,
  };

  menu.push(newLink);
  menu.sort(itemSorter);
  updateUi();

  return function () {
    var index = menu.indexOf(newLink);
    if (index < 0) {
      return;
    }
    menu.splice(index, 1);
    updateUi();
  };
}

function addBaseConfig(config) {
  if (config) {
    baseConfiguration = config;
  }
  mani.name = config.site ? config.site.name : "Node-RED Dashboard";
  mani.short_name = mani.name.replace("Node-RED", "").trim();
  mani.background_color =
    config.theme.themeState["page-titlebar-backgroundColor"].value;
  mani.theme_color =
    config.theme.themeState["page-titlebar-backgroundColor"].value;
  updateUi();
}

function getTheme() {
  if (
    baseConfiguration &&
    baseConfiguration.hasOwnProperty("theme") &&
    typeof baseConfiguration.theme !== "undefined"
  ) {
    return baseConfiguration.theme.themeState;
  } else {
    return undefined;
  }
}

function getSizes() {
  if (
    baseConfiguration &&
    baseConfiguration.hasOwnProperty("site") &&
    typeof baseConfiguration.site !== "undefined" &&
    baseConfiguration.site.hasOwnProperty("sizes")
  ) {
    return baseConfiguration.site.sizes;
  } else {
    return { sx: 48, sy: 48, gx: 6, gy: 6, cx: 6, cy: 6, px: 0, py: 0 };
  }
}

function isDark() {
  if (
    baseConfiguration &&
    baseConfiguration.hasOwnProperty("theme") &&
    baseConfiguration.theme.hasOwnProperty("themeState")
  ) {
    var rgb = parseInt(
      baseConfiguration.theme.themeState[
        "page-sidebar-backgroundColor"
      ].value.substring(1),
      16
    );
    var luma =
      0.2126 * ((rgb >> 16) & 0xff) +
      0.7152 * ((rgb >> 8) & 0xff) +
      0.0722 * ((rgb >> 0) & 0xff); // per ITU-R BT.709
    if (luma > 128) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  } // if in doubt - let's say it's light.
}
