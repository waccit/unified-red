var defaultMenuEntities = {
    'ur_folder': {
        type: 'ur_folder',
        users: [],
        icon: 'dashboard',
        name: 'Folder',
    },
    'ur_page': {
        type: 'ur_page',
        users: [],
        icon: 'folder',
        name: 'Page',
        width: 6,
        disp: true,
    },
    'ur_group': {
        type: 'ur_group',
        users: [],
        name: 'Group',
        widthLg: 6,
        widthMd: 6,
        widthSm: 12,
        disp: true,
    },
    'ur_tab': {
        type: 'ur_tab',
        users: [],
        name: 'Tab',
    },
    'ur_link': {
        type: 'ur_link',
        users: [],
        icon: 'link',
        name: 'Link',
        target: 'newtab',
    },
};

(function () {
    function injectJsTreeStyles() {
        if (document.getElementById('ur-jstree-styles')) {
            return; // Styles already injected
        }
        const style = document.createElement('style');
        style.id = 'ur-jstree-styles';
        style.textContent = `
            ul.jstree-container-ul.jstree-children.jstree-wholerow-ul.jstree-no-dots {
                margin-left: 0 !important;
            }
            .badge {
                display: inline-block;
                padding: 0.25em 0.6em;
                font-size: 0.8em;
                font-weight: 500;
                line-height: 1;
                text-align: center;
                white-space: nowrap;
                vertical-align: baseline;
                border-radius: 0.375rem;
                margin-right: 0.25rem;
                margin-top: 0.5rem;
                border: 1px solid #aaa;
            }
            .badge-standard {
                color: #444;
                background-color: #f4f4f4;
            }
            .badge-selected {
                color: #444;
                background-color: #ccecff;
            }
            .badge-none {
                color: #444;
                background-color: #f9c9c9;
            }
            ul.jstree-children {
                margin-left: 10px !important;
                padding-left: 0 !important;
            }
            li.jstree-node {
                margin-left: 0 !important;
                padding-left: 10px !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Inject styles when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectJsTreeStyles);
    } else {
        injectJsTreeStyles();
    }

    function extractNodesFromConfig(nodeType, parentType, parentNode) {
        var nodesArray = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === nodeType && (!parentType || node[parentType] === parentNode?.id)) {
                nodesArray.push(node);
            }
        });
        return nodesArray;
    }

    function extractFolderChildren(folderNode) {
        const folder = {
            text: folderNode.name,
            id: folderNode.id,
            type: folderNode.type === 'ur_folder' ? 'folder' : 'link',
            children: [],
        };
        extractNodesFromConfig('ur_page', 'folder', folderNode).forEach((page) => {
            const pageNode = {
                text: page.name,
                id: page.id,
                type: 'page',
                children: [],
            };
            extractNodesFromConfig('ur_group', 'page', page).forEach((group) => {
                const groupNode = {
                    text: group.name,
                    id: group.id,
                    type: 'group',
                    children: extractNodesFromConfig('ur_tab', 'group', group).map((tab) => ({
                        text: tab.name,
                        id: tab.id,
                        type: 'tab',
                    })),
                };
                pageNode.children.push(groupNode);
            });
            folder.children.push(pageNode);
        });

        extractNodesFromConfig('ur_link', 'folder', folderNode).forEach((link) => {
            folder.children.push({
                text: link.name,
                id: link.id,
                type: 'link',
            });
        });

        extractNodesFromConfig('ur_folder', 'folder', folderNode).forEach((childFolder) => {
            folder.children.push(extractFolderChildren(childFolder));
        });

        return folder;
    }

    function extractRootFolders() {
        var rootFoldersArray = [];
        var rootLinksArray = [];

        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFoldersArray.push(node);
            }
            if (node.type === 'ur_link' && !node.folder) {
                rootLinksArray.push(node);
            }
        });

        return [...rootFoldersArray, ...rootLinksArray];
    }

    function scrollToNode(nodeId) {
        let treeInstance = $.jstree.reference('#jstree');
        if (!treeInstance) {
            console.error('jsTree instance not available for scrollToNode');
            return;
        }

        let node = treeInstance.get_node(nodeId, true);

        if (node && node.length) {
            // Ensure the node is visible and scroll to it
            treeInstance._open_to(nodeId);
            setTimeout(() => {
                node[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200); // Added a delay to ensure the node is fully loaded and visible
        }
    }

    function getPathToNode(nodeId) {
        let treeInstance = $.jstree.reference('#jstree');
        if (!treeInstance) {
            console.error('jsTree instance not available for getPathToNode');
            return '<span class="badge badge-none">None</span>';
        }

        let currentNode = treeInstance.get_node(nodeId);
        if (!currentNode) {
            return `<i class="fa fa-columns"></i> Selected Tab: <span class="badge badge-none">None</span>`;
        }

        let pathArray = [];
        while (currentNode && currentNode.id !== '#') {
            let nodeType = currentNode.type || 'default';
            let badge = `<span class="badge badge-${nodeType === 'tab' ? 'selected' : 'standard'}"><i class="${
                currentNode.icon
            }"></i> ${currentNode.text}</span>`;
            pathArray.unshift(badge);
            currentNode = treeInstance.get_node(currentNode.parent);
        }

        return `<i class="fa fa-columns"></i> Selected Tab: ${pathArray.join(
            ' <i class="fa fa-chevron-right" style="font-size: 0.7em"></i> '
        )}`;
    }

    function refreshJsTreeFromNodes() {
        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder));
        var instance = $.jstree.reference('#jstree');
        if (instance) {
            instance.settings.core.data = foldersTreeData;
            instance.refresh({ skip_loading: false });
        } else {
            console.error('jsTree instance not available for updateJsTreeData');
        }
    }

    function initializeJsTree(tabId) {
        if ($('#jstree').length === 0) {
            console.error("Element with ID 'jstree' not found in the DOM");
            return;
        }
        selectedTab = tabId;

        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder));

        if ($.jstree.reference('#jstree')) {
            $('#jstree').jstree('destroy');
        }

        // Initial jsTree setup
        $('#jstree').jstree({
            'core': {
                'data': foldersTreeData,
                'dblclick_toggle': false,
            },
            'multiple': false,
            'plugins': ['types', 'search', 'wholerow'],
            'types': {
                'default': {
                    // 'icon': 'fa fa-folder-o',
                },
                'folder': {
                    'icon': 'fa fa-folder-o',
                },
                'page': {
                    'icon': 'fa fa-file-o',
                },
                'group': {
                    'icon': 'fa fa-window-maximize',
                },
                'tab': {
                    'icon': 'fa fa-columns',
                },
                'link': {
                    'icon': 'fa fa-link',
                },
            },
            'search': {
                'show_only_matches': true,
            },
        });

        // handle click on a node (tab or non-tab)
        $('#jstree').on('select_node.jstree', function (e, data) {
            if (data.node.type === 'tab') {
                selectedTab = data.node;
                $('#selectedTabDisplay').html(getPathToNode(selectedTab.id));
            } else {
                var instance = $.jstree.reference('#jstree');
                if (instance.is_open(data.node)) {
                    instance.close_node(data.node);
                } else {
                    instance.open_node(data.node);
                }
                if (selectedTab) {
                    instance.deselect_node(data.node);
                    instance.select_node(selectedTab.id);
                }
            }
        });

        var to = false;
        $('#treeSearch').keyup(function () {
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                var v = $('#treeSearch').val();
                var instance = $.jstree.reference('#jstree');
                if (instance) {
                    instance.search(v);
                }
            }, 250);
        });

        $('#jstree').on('hover_node.jstree', function (e, data) {
            $('.jstree-hover-button').remove();
            let buttons = [];
            let node_config = {};
            const getButtonHTML = (icon) => {
                return `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button" style="float: right; z-index: 1000; margin-top:2px"> ${
                    icon !== 'pencil' ? '<i class="fa fa-plus"></i>' : ''
                } ${icon ? '<i class="fa fa-' + icon + '"></i>' : ''}</a>`;
            };

            const addButton = (icon, type, parentField) => {
                let btn = $(getButtonHTML(icon));
                btn.on('click', function () {
                    node_config = { ...defaultMenuEntities[`ur_${type}`] };
                    node_config._def = RED.nodes.getType(node_config.type);
                    node_config.id = RED.nodes.id();
                    node_config.order = data.node.children.length + 1;
                    node_config.name += ` ${data.node.children.length + 1}`;
                    node_config[parentField] = data.node.id;
                    RED.nodes.add(node_config);
                    RED.history.push({
                        t: 'add',
                        nodes: [node_config.id],
                        dirty: RED.nodes.dirty(),
                    });
                    RED.nodes.dirty(true);
                    refreshJsTreeFromNodes();
                });
                return btn;
            };

            let editButton = $(getButtonHTML('pencil'));
            editButton.on('click', function () {
                let tabNode = RED.nodes.node(data.node.id);
                if (tabNode) {
                    RED.editor.editConfig('', tabNode.type, tabNode.id);
                }
            });
            buttons.push(editButton);

            switch (data.node.type) {
                case 'folder':
                    buttons.push(
                        addButton('file-o', 'page', 'folder'),
                        addButton('folder-o', 'folder', 'folder'),
                        addButton('link', 'link', 'folder')
                    );
                    break;
                case 'page':
                    buttons.push(addButton('window-maximize', 'group', 'page'));
                    break;
                case 'group':
                    buttons.push(addButton('columns', 'tab', 'group'));
                    break;
                case 'tab':
                    break;
            }

            var $node = $('#' + data.node.id);
            var $anchor = $node.children('.jstree-wholerow');
            $anchor.append(buttons);
        });

        $('#jstree').on('dehover_node.jstree', function () {
            $('.jstree-hover-button').remove();
        });

        // Restore selected tab when the node is reopened, or select the first tab if none is selected
        $('#jstree').on(
            'ready.jstree',
            function () {
                var instance = $.jstree.reference('#jstree');
                if (!instance) {
                    console.error('jsTree instance not available');
                    return;
                }

                if (tabId) {
                    instance.select_node(tabId);
                    var selectedNode = instance.get_node(tabId);
                    if (selectedNode) {
                        $('#selectedTabDisplay').html(getPathToNode(selectedNode.id));
                        setTimeout(() => {
                            scrollToNode(tabId);
                        }, 200);
                    } else {
                        $('#selectedTabDisplay').html(getPathToNode(null));
                    }
                } else {
                    // If no tab is selected, default to the first available tab
                    var rootNode = instance.get_node('#');
                    if (rootNode && rootNode.children_d) {
                        $('#selectedTabDisplay').html(getPathToNode(null));
                    }
                }
            }.bind(this)
        );

        // Update the selected tab display outside of the ready event
        if (tabId) {
            var instance = $.jstree.reference('#jstree');
            if (instance) {
                var storedNode = instance.get_node(tabId);
                if (storedNode) {
                    $('#selectedTabDisplay').html(getPathToNode(storedNode.id));
                } else {
                    $('#selectedTabDisplay').html(getPathToNode(null));
                }
            }
        } else {
            $('#selectedTabDisplay').html(getPathToNode(null));
        }
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
})();
