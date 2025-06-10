(function () {
    // Inject CSS for jsTree styling
    function injectJsTreeStyles() {
        if (document.getElementById('ur-jstree-styles')) {
            return; // Styles already injected
        }

        const style = document.createElement('style');
        style.id = 'ur-jstree-styles';
        style.textContent = `
            /* Remove left margin from jstree container ul */
            ul.jstree-container-ul.jstree-children.jstree-wholerow-ul.jstree-no-dots {
                margin-left: 0 !important;
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
            if (node.type === nodeType && node[parentType] === parentNode.id) {
                nodesArray.push(node);
            }
        });
        return nodesArray;
    }

    function extractFoldersFromConfig() {
        var foldersWithChildrenArray = [];
        RED.nodes.eachConfig(function (folderNode) {
            if (folderNode.type === 'ur_folder' && !folderNode.folder) {
                var folderWithChildren = extractFolderChildren(folderNode);
                foldersWithChildrenArray.push(folderWithChildren);
            }
        });
        return foldersWithChildrenArray;
    }

    function extractFolderChildren(folderNode) {
        var folderWithChildren = {
            text: folderNode.name,
            id: folderNode.id,
            type: 'folder',
            children: [],
        };

        var pages = extractNodesFromConfig('ur_page', 'folder', folderNode);
        pages.forEach(function (page) {
            var pageWithChildren = {
                text: page.name,
                id: page.id,
                type: 'page',
                children: [],
            };
            var groups = extractNodesFromConfig('ur_group', 'page', page);
            groups.forEach(function (group) {
                var groupWithChildren = {
                    text: group.name,
                    id: group.id,
                    type: 'group',
                    children: [],
                };
                var tabs = extractNodesFromConfig('ur_tab', 'group', group);
                tabs.forEach(function (tab) {
                    groupWithChildren.children.push({
                        text: tab.name,
                        id: tab.id,
                        type: 'tab',
                    });
                });
                pageWithChildren.children.push(groupWithChildren);
            });
            folderWithChildren.children.push(pageWithChildren);
        });

        var childFolders = extractNodesFromConfig('ur_folder', 'folder', folderNode);
        childFolders.forEach(function (childFolder) {
            var childFolderWithChildren = extractFolderChildren(childFolder);
            folderWithChildren.children.push(childFolderWithChildren);
        });

        return folderWithChildren;
    }

    function extractRootFolders() {
        var rootFoldersArray = [];
        RED.nodes.eachConfig(function (folderNode) {
            if (folderNode.type === 'ur_folder' && !folderNode.folder) {
                rootFoldersArray.push(folderNode);
            }
        });
        return rootFoldersArray;
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
            return 'None';
        }

        let pathArray = [];
        let currentNode = treeInstance.get_node(nodeId);

        if (!currentNode) {
            return 'None';
        }

        while (currentNode && currentNode.id !== '#') {
            pathArray.unshift(currentNode.text);
            currentNode = treeInstance.get_node(currentNode.parent);
        }

        return pathArray.join('][');
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
            },
            'search': {
                // 'show_only_matches': true
            },
        });

        // handle click on a node (tab or non-tab)
        $('#jstree').on('select_node.jstree', function (e, data) {
            if (data.node.type === 'tab') {
                selectedTab = data.node;
                let path = getPathToNode(selectedTab.id);
                $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
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
            console.log('data', data.node.type);
            $('.jstree-hover-button').remove();

            let buttons = [];

            switch (data.node.type) {
                case 'folder':
                    break;
                case 'page':
                    break;
                case 'group':
                    const node_config = {
                        'id': RED.util.generateId(),
                        'type': 'ur_tab',
                        'name': 'Tab 1',
                        'order': 1,
                        'group': data.node.id,
                        'disabled': false,
                        'hidden': false,
                        'access': '',
                    };

                    let addGroupButton = $(
                        `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button"><i class="fa fa-plus"></i>tab</a>`
                    );
                    addGroupButton.on('click', function (evt) {
                        let tabNode = RED.nodes.node(data.node.id);
                        if (tabNode) {
                            RED.createNode(node_config);
                        }
                    });
                    buttons.push(addGroupButton);

                    break;
                case 'tab':
                    break;
            }
            let editButton = $(
                `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button"><i class="fa fa-pencil"></i> </a>`
            );
            editButton.on('click', function (evt) {
                let tabNode = RED.nodes.node(data.node.id);
                if (tabNode) {
                    RED.editor.editConfig('', tabNode.type, tabNode.id);
                }
            });
            buttons.push(editButton);

            var $node = $('#' + data.node.id);
            var $anchor = $node.children('.jstree-anchor');
            $anchor.css('position', 'relative');
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
                        let path = getPathToNode(selectedNode.id);
                        $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
                        setTimeout(() => {
                            scrollToNode(tabId);
                        }, 200);
                    } else {
                        $('#selectedTabDisplay').text('Selected Tab: None');
                    }
                } else {
                    // If no tab is selected, default to the first available tab
                    var rootNode = instance.get_node('#');
                    if (rootNode && rootNode.children_d) {
                        $('#selectedTabDisplay').text('Selected Tab: None');
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
                    let path = getPathToNode(storedNode.id);
                    $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
                } else {
                    $('#selectedTabDisplay').text('Selected Tab: None');
                }
            }
        } else {
            $('#selectedTabDisplay').text('Selected Tab: None');
        }
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
})();
