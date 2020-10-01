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
            let absPath = path.join(staticRoot, req.body.p || '');
            if (absPath.indexOf(staticRoot) === -1) { // do not navigate away from static root
                absPath = staticRoot;
            }
            callback(null, absPath);
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
    });
    const upload = multer({ storage: storage });

    function traverseDir(dir, recursive, filter) {
        let files = [];
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.indexOf('.') !== 0) {
                    let fullPath = path.join(dir, file);
                    let stat = fs.lstatSync(fullPath);
                    if (stat.isDirectory()) {
                        let d = { name: file, type: 'd', mtime: stat.mtime.toISOString(), size: stat.size };
                        if (recursive) {
                            d.files = traverseDir(fullPath, recursive, filter);
                            if (filter && !d.files.length) {
                                return; // recursive filter traverse found no files in this folder. 
                            }
                        }
                        files.push(d);
                    } else {
                        if (!filter || new RegExp('\.(' + filter.replace(/\W+/g, '|') + ')$', 'i').test(file)) {
                            files.push({ name: file, type: 'f', mtime: stat.mtime.toISOString(), size: stat.size });
                        }
                    }
                }
            });
        }
        return files;
    }

    function copyFolderSync(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(file => {
            let srcPath = path.join(src, file);
            let destPath = path.join(dest, file);
            if (fs.lstatSync(srcPath).isFile()) {
                fs.copyFileSync(srcPath, destPath);
            } else {
                copyFolderSync(srcPath, destPath);
            }
        });
    }

    RED.httpAdmin.get('/ur_base/filebrowser/list/', function (req, res) {
        try {
            let filter = req.query.f || '';
            let recursive = !!req.query.r;
            let absPath = path.join(staticRoot, req.query.p || '');
            if (absPath.indexOf(staticRoot) === -1) { // do not navigate away from static root
                absPath = staticRoot;
            }
            if (fs.existsSync(absPath)) {
                let files = traverseDir(absPath, recursive, filter);
                res.json({
                    path: absPath.substr(staticRoot.length - 1) || '/',
                    files: files
                });
            } else {
                res.send('file/folder path does not exist');
            }
        }
        catch (e) {
            console.error(e);
            res.send(e);
        }
    });

    RED.httpAdmin.post('/ur_base/filebrowser/new/', function (req, res) {
        let absPath = path.join(staticRoot, req.body.p || '');
        if (absPath.indexOf(staticRoot) === -1) { // do not navigate away from static root
            res.status(500).send('Illegal path');
            return;
        }
        fs.mkdir(absPath, function(err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send("ok");
        })
    });

    RED.httpAdmin.post('/ur_base/filebrowser/copy/', function (req, res) {
        let results = { errors: 0, success: 0 };
        let files = Array.isArray(req.body.files) ? req.body.files : [ req.body.files ];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            try {
                let src = path.join(staticRoot, file.src);
                if (src.indexOf(staticRoot) === -1) { // do not navigate away from static root
                    results[file.src] = 'Illegal source path';
                    results.errors += 1;
                    continue;
                }
                let dest = path.join(staticRoot, file.dest);
                if (dest.indexOf(staticRoot) === -1) { // do not navigate away from static root
                    results[file.src] = 'Illegal destination path';
                    results.errors += 1;
                    continue;
                }
                if (fs.lstatSync(src).isDirectory()) {
                    copyFolderSync(src, dest);
                } else {
                    fs.copyFileSync(src, dest);
                }
                results[file.src] = true;
                results.success += 1;
            } catch (err) {
                results[file.src] = err;
                results.errors += 1;
            }
            if (i === files.length - 1) { // send on last result
                res.json(results);
            }
        }
    });

    RED.httpAdmin.post('/ur_base/filebrowser/move/', function (req, res) {
        let results = { errors: 0, success: 0 };
        let files = Array.isArray(req.body.files) ? req.body.files : [ req.body.files ];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            try {
                let src = path.join(staticRoot, file.src);
                if (src.indexOf(staticRoot) === -1) { // do not navigate away from static root
                    results[file.src] = 'Illegal source path';
                    results.errors += 1;
                    continue;
                }
                let dest = path.join(staticRoot, file.dest);
                if (dest.indexOf(staticRoot) === -1) { // do not navigate away from static root
                    results[file.src] = 'Illegal destination path';
                    results.errors += 1;
                    continue;
                }
                fs.renameSync(src, dest);
                results[file.src] = true;
                results.success += 1;
            } catch (err) {
                results[file.src] = err;
                results.errors += 1;
            }
            if (i === files.length - 1) { // send on last result
                res.json(results);
            }
        }
    });

    function deleteFolderRecursive(path) {
        if(fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file) {
              var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    RED.httpAdmin.post('/ur_base/filebrowser/delete/', function (req, res) {
        let results = { errors: 0, success: 0 };
        let files = Array.isArray(req.body.files) ? req.body.files : [ req.body.files ];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            try {
                let filepath = path.join(staticRoot, file);
                if (fs.existsSync(filepath)) {
                    if (fs.lstatSync(filepath).isDirectory()) {
                        deleteFolderRecursive(filepath);
                    }
                    else {
                        fs.unlinkSync(filepath);
                    }
                    results[file] = true;
                    results.success += 1;
                }
            } catch (err) {
                results[file] = err;
                results.errors += 1;
            }
            if (i === files.length - 1) { // send on last result
                res.json(results);
            }
        }
    });

    RED.httpAdmin.post('/ur_base/filebrowser/upload/', upload.array('files'), function (req, res, next) {
        res.send("ok");
    });
};
