# unified-red

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
![NPM version](https://badge.fury.io/js/node-red-dashboard.svg)
![NPM](https://img.shields.io/npm/l/node-red-dashboard)

This module provides a set of nodes in Node-RED to create a customizable building automation user interface or HMI (human-machine interface). Unified-RED is a fork of the popular [node-red-dashboard](https://github.com/node-red/node-red-dashboard) project and adds several features and enhancements:

-   Completely rebuilt user security including multi-user support, user roles, user expiration dates, password reset, and more.
-   New menu system including unlimited folder levels.
-   Date, weekday, and holiday **Event Scheduling**
-   Local or cloud **Data Logging** as well as an enhanced chart dashboard node to easily plot historical data
-   Local or cloud **Alarm Logging** and alarm console node
-   Equipment animated graphics node
-   Reusable templated pages aka _Multi pages_
-   New responsive UI rewritten in Angular 9 and Bootstrap 4
-   Built-in file manager
-   Remote uptime monitor server and API for system integrator monitoring

These nodes require node.js version 8 or newer.

## Pre-requisites

Unified-RED requires [Node-RED](https://nodered.org) and either [MongoDB](https://www.mongodb.com) or [SQLite](https://www.sqlite.org) to be installed. Alternatively, [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/) can be used for cloud environments. Postgres, MySQL, MariaDB, and Microsoft SQL Server are also supported with the installation of additional database drivers.

## Install

To install the stable version:

-   Use the `Menu - Manage palette` option and search for `unified-red` or run the following command in your Node-RED user directory - typically `~/.node-red`:
    ```
    npm i unified-red
    ```
-   Restart your Node-RED instance and you should have UI nodes available in the palette and a new `Unified-RED` tab in the
    right side panel.
-   Continue to the user interface at <http://localhost:1880/ui> (if the default settings are used) to complete the initial setup.

## Advanced Settings

For a typical installation, the initial setup provides you with everything you need to get Unified-RED setup. However if you need to make a change after initial setup is completed, there are two files that contain all Unified-RED settings:

### Node-RED's settings.js File

-   **Unified-RED URL** - The `ui.path` setting is used (and required) to set Unified-RED's URL to root ("/").
-   **Node-RED Editor URL** - The `httpAdminRoot` setting is used (and required) to set the Node-RED editor URL to `/admin`.
-   **Node-RED Editor Authentication** - The `adminAuth` setting is used (and required) to apply Unified-RED's user authentication to the Node-RED editor. For example, on a Linux machine:
    ```json
    adminAuth: require("/home/<username>/unified-red/admin-auth"),
    ```
    or on the Dialog SmartServer IoT:
    ```json
    adminAuth: require("/media/sdcard/data/unified-red/admin-auth"),
    ```
-   **Static Web Files** - The `httpStatic` setting is used (and required) to include static files (CSS, JS, image, etc) into the web interface. For example, on a Linux machine:
    ```json
    httpStatic: "/home/<username>/unified-red/static/",
    ```
    or on the Dialog SmartServer IoT:
    ```json
    httpStatic: "/media/sdcard/data/unified-red/static/",
    ```

### Unified-RED's config.json File

-   **dbConnection** - URL to the database server instance including the server hostname, port, username, password, and database name, e.g. `mongodb://user@password:localhost:27017/unified-red` for local instances
-   **jwtsecret** - Unique random encryption key used to secure logins. During initial setup a random key is generated for you, so you typically will never need to change this.
-   **smtp** - SMTP email server information used for system emails such as password resets. Includes server hostname, port, from address, username, password, and optional `ssl` encryption. If `ssl` is true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false. For example:
    ```json
    {
        "fromAddress": "'Unified' <unified@your-smtp-server.com>",
        "host": "your-smtp-server.com",
        "port": 587,
        "ssl": false,
        "user": "your-username",
        "password": "your-password"
    }
    ```

## Layout

The dashboard layout should be considered as a grid using the [Bootstrap grid system](https://getbootstrap.com/docs/layout/grid/).

-   **Page** - Each page is made up of 12 columns.

-   **Group** - Each group element can fill any number of columns on a page. The number of columns can vary between small, medium, and large viewing devices. Small usually applies to smart phone users, medium for tablet users, and large for desktop users.

-   **Tab** - All groups are tabbable therefore each group should contain at least 1 tab. If only one tab is used, then the tab header is hidden.

-   **Widget** - Each widget in the group also has a width - by default, 'auto' which means it will fill the width of the group it is in, but you can set it to a fixed number of columns.

The layout algorithm of the dashboard always tries to place items as high and to the left as they can within their container - this applies to how groups are positioned on the page, as well as how widgets are positioned in a group.

Given a group with width 6, if you add six widgets, each with a width of 2, then they will be laid out in two rows - three widgets in each.

If you add two groups of width 6, as long as your browser window is wide enough, they will sit alongside each other.

It is advisable to use multiple groups if possible, rather than one big group, so that the page can dynamically resize on smaller screens.

## Features

### Dashboard sidebar

The widget layout is managed by a `dashboard` tab in the sidebar of the Node-RED editor.

#### Layout:

From here you can build your UI navigational menu, consisting of folders and pages, as well as manage the contents of each page - groups, tabs, and widgets. You can re-order the folders, pages, groups, tabs and widgets using drag-and-drop.

Links to other web pages can also be added to the menu.

#### Site:

-   **Site** - The name and address of the site (optional)
-   **Contact** - The name and email address of the site's primary contact (optional)
-   **Monitor Server** - URL of the monitor server used to monitor the status/uptime of Unified-RED. Using a monitor server is optional and should only be used by system integrators that actively maintain the site's control system. When used, Unified-RED will heartbeat the monitor server every 24 hours with a unique site ID, version number, and site and contact information.

#### Files:

From here you can upload, rename, move, delete files, and create new folders in your `static` web folder. Primarily used to transfer image, CSS, and JavaScript files used to create custom HMI graphics.

### Widgets

-   **Alarm** - evaluates an incoming message against a set of configurable conditions. Supports 4 severities - info, warning, alert, and critical.
-   **Alarm Console** - logs alarm messages and notifies web UI. Can be connected to other nodes for messaging, e.g. an email node to send email alerts.
-   **Animation** - used to create animated graphical widgets that are driven by incoming messages.
<!-- - **Audio out** - a widget that will let you play audio (wav or mp3) or send Text to Speech (TTS) to the client. -->
-   **Button** - triggers a message when clicked. Supports Material icons. Text and background colors are configurable.
-   **Chart** - plots a line chart of historical data.
<!-- - **Colour Picker** - a colour picker widget. -->
-   **Compare** - evaluates incoming messages from multiple topics to compute a state. Supports boolean expressions with deadbands.
-   **Data Log** - logs incoming messages into a data logger. Individual topic data log settings can be included in the message, such as max days, units of measurement, enumeration presets, and metadata tags.
    <!-- - **Date Picker** - a date picker widget. The displayed Date format can be specified in the Site tab using moment.js formatting. -->
    <!-- - **Dropdown** - a dropdown select widget has been added. Multiple label, value pairs can be specified. The choices can also be set via `msg.options` containing an array of objects. If just text then the value will be the same as the label, otherwise you can specify both by using an object of "label":"value" pairs :

          [ "Choice 1", "Choice 2", {"Choice 3": 3} ]

       Setting `msg.payload` will pre-select the value in the dropdown.-->

-   **Form** - a widget that can be composed of several input form sub-widgets. When submitted all values are sent as individual messages.
    <!-- - **Gauge** - has 4 modes - *standard* (simple gauge), *donut* (complete 360&deg;), *compass*, and *wave*. You can also specify the colour range of the standard and donut gauges. -->
    <!-- - **Notification** - creates alerts to the user - can either be a toast popup, or a dismissable alert box. The alert may be targeted to a single user. -->
    <!-- - **Numeric** - a Numeric input widget with up/down buttons. -->
-   **Pager Duty** - sends messages to the Pager Duty alerting service.
    <!-- - **Slider** - a simple horizontal slider, with variable step size. -->
    <!-- - **Switch** - can also set two icons and/or colours depending on state. -->
-   **Table** - displays messages of multiple topics in a tabular format, where each topic is assigned a column or row.
-   **Template** - the template node allows the user to specify and create their own widgets within the framework using HTML, JavaScript, and jQuery. You may also use this to override the built in CSS styles.
-   **Text** - display the value of a message. The layout of the `label`, and `value` can be configured.
-   **Text input** - text input box, with optional label. Also supports number, password, email, color picker, and date picker input box types.

Group labels are optional.

Any widget can be disabled by passing in a `msg.enabled` property set to `false;`. _Note:_ this doesn't stop the widget receiving messages but does stop inputs being active and does re-style the widget.

### Icons

The dashboard has 3 sets of icons built in. They are:

-   [Angular Material icons](https://klarsys.github.io/angular-material-icons/): e.g. `send`
-   [Material Design Iconfont](https://jossef.github.io/material-design-icons-iconfont/): e.g. `mi-alarm_on` - note: add mi- to the icon name in the iconset.
<!-- - [Themify icons](https://themify.me/themify-icons): e.g. `check` or `close` - note: omit the ti- prefix -->
-   [Font Awesome Free 5.3.1](https://fontawesome.com/icons): e.g. `fas fa-fire`

You can use Material <!-- and Themify --> icons in any of the Icon fields. You may also be able to use some icons in labels via their inline style eg `<i class="fas fa-flag"></i>`

### Multi Pages

Multi pages are pseudo-pages used to simplify creating pages with identical groups, tabs, and widgets across multiple building automation devices. In building automation systems, it is very common to use the same HMI graphic across multiple devices of the same type, e.g. VAV controllers. Instead of building an individual page for each device, simply make the page **Multi** and provide it with instance information to map incoming messages to their corresponding widgets.

A Multi page requires:

-   **Instance Name Expression** - must include {x}.
-   **Instances** - the lists of instance **names** and **parameters** must match in length, where **names** refer to the displayed name or perhaps equipment tag and **parameters** refers to a set parameters included in the message topic, such as a device ID, device address, or array index.

## Discussions and suggestions

Use the [Unified-RED Discussion Forum](https://groups.google.com/g/unified-red) to ask questions or to discuss new features.

## Contributing

Before raising a pull-request, please read our [contributing guide](https://github.com/waccit/unified-red/blob/master/CONTRIBUTING.md).

This project adheres to the [Contributor Covenant 1.4](http://contributor-covenant.org/version/1/4/). By participating, you are expected to uphold this code. Please report unacceptable behavior to any of the [project's core team](https://github.com/orgs/waccit/teams/core).

## Developers

To setup your Unified-RED development environment:

```
cd ~/
git clone https://github.com/waccit/unified-red.git
cd unified-red
npm install
ng build --prod
```

Then symlink Node-RED to your development folder:

For NPM version > 9.0.0, run
```
cd ~/.node-red
npm install --save ~/unified-red
```

For NPM version >= 9.0.0, run
```
ln -s ~/unified-red ~/.node-red/node_modules
```

**NOTE:** When manually installing Unified-RED, the development folder cannot be reside in node_modules.

When reinstalling or relinking Unified-RED, be sure to unlink Node-RED from your development folder:

```
cd ~/.node-red/node_modules
unlink unified-red
```

### Building:

After finishing changes to the front-end code in the src folder, you can use [Angular CLI](https://cli.angular.io) to update and rebuild the project:

```
ng build
```

The build artifacts will be stored in the `dist/` directory.

Use the _--watch_ flag to build automatically on a file save:

```
ng build --watch
```

Use the _--prod_ flag for a production build:

```
ng build --prod
```

We also suggest _lint_ checking with:

```
ng lint
```

If submitting a Pull Request (PR) please do NOT include the minified `/dist` files.

Thank you
