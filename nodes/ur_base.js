module.exports = function (RED) {
    var ui = require('../ui')(RED);
    var path = require('path');
    var fs = require('fs');
    var multer = require('multer');
    var node;
    var set = RED.settings.ui || '{}';
    let monitor = require('../monitor');

    function BaseNode(config) {
        RED.nodes.createNode(this, config);
        node = this;

        if (monitor) {
            monitor.start(config.site);
        }

        // var baseFontName =
        //     '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif';

        // var defaultLightTheme = {
        //     baseColor: '#0094CE',
        //     baseFont: baseFontName,
        // };
        // var defaultDarkTheme = {
        //     baseColor: '#097479',
        //     baseFont: baseFontName,
        // };
        // var defaultCustomTheme = {
        //     name: 'Untitled Theme 1',
        //     baseColor: defaultLightTheme.baseColor,
        //     baseFont: baseFontName,
        // };
        // var defaultAngularTheme = {
        //     primary: 'indigo',
        //     accents: 'teal',
        //     warn: 'red',
        //     background: 'grey',
        // };

        // Setup theme name
        // First try old format (for upgrading with old flow file)
        // Then try new format
        // Else fallback to theme-light
        // var themeName;
        // if (typeof config.theme === 'string') {
        //     themeName = config.theme;
        // } else {
        //     themeName = config.theme.name || 'theme-light';
        // }

        // Setup other styles
        // var defaultThemeState = {};
        // if (themeName === 'theme-light') {
        //     defaultThemeState['base-font'] = { value: baseFontName };
        //     defaultThemeState['base-color'] = { value: '#0094CE' };
        //     defaultThemeState['page-backgroundColor'] = { value: '#fafafa' };
        //     defaultThemeState['page-titlebar-backgroundColor'] = {
        //         value: '#0094CE',
        //     };
        //     defaultThemeState['page-sidebar-backgroundColor'] = {
        //         value: '#ffffff',
        //     };
        //     defaultThemeState['group-backgroundColor'] = { value: '#ffffff' };
        //     defaultThemeState['group-textColor'] = { value: '#000000' };
        //     defaultThemeState['group-borderColor'] = { value: '#ffffff' };
        //     defaultThemeState['widget-textColor'] = { value: '#111111' };
        //     defaultThemeState['widget-backgroundColor'] = { value: '#0094CE' };
        // } else {
        //     defaultThemeState['base-font'] = { value: baseFontName };
        //     defaultThemeState['base-color'] = { value: '#097479' };
        //     defaultThemeState['page-backgroundColor'] = { value: '#111111' };
        //     defaultThemeState['page-titlebar-backgroundColor'] = {
        //         value: '#097479',
        //     };
        //     defaultThemeState['page-sidebar-backgroundColor'] = {
        //         value: '#000000',
        //     };
        //     defaultThemeState['group-backgroundColor'] = { value: '#333333' };
        //     defaultThemeState['group-textColor'] = { value: '#10cfd8' };
        //     defaultThemeState['group-borderColor'] = { value: '#555555' };
        //     defaultThemeState['widget-textColor'] = { value: '#eeeeee' };
        //     defaultThemeState['widget-backgroundColor'] = { value: '#097479' };
        // }

        // var defaultThemeObject = {
        //     name: themeName,
        //     lightTheme: config.theme.lightTheme || defaultLightTheme,
        //     darkTheme: config.theme.darkTheme || defaultDarkTheme,
        //     customTheme: config.theme.customTheme || defaultCustomTheme,
        //     angularTheme: config.theme.angularTheme || defaultAngularTheme,
        //     themeState: config.theme.themeState || defaultThemeState,
        // };

        this.config = {
            // theme: defaultThemeObject,
            site: config.site,
        };
        ui.addBaseConfig(this.config);
    }
    RED.nodes.registerType('ur_base', BaseNode);

    RED.library.register('themes');

    RED.httpAdmin.get('/uisettings', function (req, res) {
        res.json(set);
    });

    RED.httpAdmin.get('/ur_base/js/*', function (req, res) {
        var filename = path.join(__dirname, '../dist/assets/js', req.params[0]);
        res.sendFile(filename, function (err) {
            if (err) {
                if (node) {
                    node.warn(
                        filename + ' not found. Maybe running in dev mode.'
                    );
                } else {
                    console.log('ur_base - error:', err);
                }
            }
        });
    });

    RED.httpAdmin.get('/ur_base/css/*', function (req, res) {
        var filename = path.join(
            __dirname,
            '../dist/assets/css',
            req.params[0]
        );
        res.sendFile(filename, function (err) {
            if (err) {
                if (node) {
                    node.warn(
                        filename + ' not found. Maybe running in dev mode.'
                    );
                } else {
                    console.log('ur_base - error:', err);
                }
            }
        });
    });

    let staticRoot = path.join(__dirname, '../static/');
    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, staticRoot);
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
    });
    const upload = multer({ storage: storage });

    function traverseDir(dir) {
        let files = {};
        fs.readdirSync(dir).forEach(file => {
            let fullPath = path.join(dir, file);
            let stat = fs.lstatSync(fullPath);
            if (stat.isDirectory()) {
                files[file] = traverseDir(fullPath);
            } else {
                files[file] = { mtime: stat.mtime.toISOString(), size: stat.size };
            }
        });
        return files;
    }

    let staticFiles = {};
    try {
        staticFiles = traverseDir(staticRoot);
    }
    catch (e) {}

    RED.httpAdmin.get('/ur_base/filebrowser/list/', function (req, res) {
        if (req.query.hasOwnProperty('refresh')) {
            try {
                staticFiles = traverseDir(staticRoot);
            }
            catch (e) {}
        }
        res.json(staticFiles);
    });

    RED.httpAdmin.post('/ur_base/filebrowser/copy/', function (req, res) {
        console.log(req.body.src, req.body.dest);
        let src = path.join(__dirname, '../static/', req.body.src);
        let dest = path.join(__dirname, '../static/', req.body.dest);
        fs.copyFile(src, dest, (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send("ok");
        });
    });

    RED.httpAdmin.post('/ur_base/filebrowser/rename/', function (req, res) {
        let src = path.join(__dirname, '../static/', req.body.src);
        let dest = path.join(__dirname, '../static/', req.body.dest);
        fs.rename(src, dest, (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send("ok");
        });
    });

    RED.httpAdmin.post('/ur_base/filebrowser/upload/', upload.array('files'), function (req, res, next) {
        res.send("ok");
    });
};
