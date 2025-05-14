(function() {
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
            children: []
        };

        var pages = extractNodesFromConfig('ur_page', 'folder', folderNode);
        pages.forEach(function (page) {
            var pageWithChildren = {
                text: page.name,
                id: page.id,
                type: 'page',
                children: []
            };
            var groups = extractNodesFromConfig('ur_group', 'page', page);
            groups.forEach(function (group) {
                var groupWithChildren = {
                    text: group.name,
                    id: group.id,
                    type: 'group',
                    children: []
                };
                var tabs = extractNodesFromConfig('ur_tab', 'group', group);
                tabs.forEach(function (tab) {
                    groupWithChildren.children.push({
                        text: tab.name,
                        id: tab.id,
                        type: 'tab'
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

    function createEditButton() {
        let editButton = $(
            '<a href="#" class="editor-button editor-button-small nr-db-sb-list-header-button"><i class="fa fa-pencil"></i> ' +
            'Edit' +
            '</a>'
        );

        editButton.on('click', function (evt) {
            console.log('evt', evt);
            if (selectedTab) {
                let tabNode = RED.nodes.node(selectedTab.id); // Assuming RED.nodes.node() gets the tab node by id
                if (tabNode) {
                    RED.editor.editConfig('', tabNode.type, tabNode.id);
                }
            }
            evt.stopPropagation();
            evt.preventDefault();
        });

        return editButton;
    }

    function scrollToNode(nodeId) {
        let treeInstance = $.jstree.reference('#jstree');
        if (!treeInstance) {
            console.error("jsTree instance not available for scrollToNode");
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
            console.error("jsTree instance not available for getPathToNode");
            return "None";
        }
        
        let pathArray = [];
        let currentNode = treeInstance.get_node(nodeId);
        
        if (!currentNode) {
            return "None";
        }
        
        while (currentNode && currentNode.id !== '#') {
            pathArray.unshift(currentNode.text);
            currentNode = treeInstance.get_node(currentNode.parent);
        }
        
        return pathArray.join('][');
    }
    
    function initializeJsTree(tabId) {
        // Check if jstree container exists
        if ($('#jstree').length === 0) {
            console.error("Element with ID 'jstree' not found in the DOM");
            return;
        }

        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map(folder => extractFolderChildren(folder));
        
        // Check if jsTree is already initialized
        if ($.jstree.reference('#jstree')) {
            // Destroy the existing instance before recreating
            $('#jstree').jstree('destroy');
        }

        // Initial jsTree setup
        $('#jstree').jstree({
            'core': {
                'data': foldersTreeData
            },
            'plugins': ['types', 'search'],
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
                }
            },
            'search': {
                // 'show_only_matches': true
            }
        });

        $('#jstree').on("select_node.jstree", function (e, data) {
            if (data.node.type === 'tab') {
                selectedTab = data.node;
                let path = getPathToNode(selectedTab.id);
                $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
            } else {
                // Prevents deselecting the current tab when clicking on non-tab nodes
                var instance = $.jstree.reference('#jstree');
                if (instance) {
                    instance.deselect_node(data.node);
                    if (selectedTab) {
                        instance.select_node(selectedTab.id);
                    }
                }
            }
            console.log("Selected node: ", data.node);
        });

        $('#jstree').on("changed.jstree", function (e, data) {
            console.log("Changed Selected Node: ", data.selected);
        });

        var to = false;
        $('#treeSearch').keyup(function () {
            if (to) { clearTimeout(to); }
            to = setTimeout(function () {
                var v = $('#treeSearch').val();
                var instance = $.jstree.reference('#jstree');
                if (instance) {
                    instance.search(v);
                }
            }, 250);
        });

        console.log("Retrieved tab ID: ", tabId);
        // Restore selected tab when the node is reopened, or select the first tab if none is selected
        $('#jstree').on('ready.jstree', function () {
            var instance = $.jstree.reference('#jstree');
            if (!instance) {
                console.error("jsTree instance not available");
                return;
            }

            if (tabId) {
                instance.select_node(tabId);
                var selectedNode = instance.get_node(tabId);
                console.log("Selected node:", selectedNode);
                if (selectedNode) {
                    let path = getPathToNode(selectedNode.id);
                    $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
                    setTimeout(() => {
                        scrollToNode(tabId); // Auto-scroll to the selected tab with delay
                    }, 200);
                } else {
                    $('#selectedTabDisplay').text('Selected Tab: None');
                }
            } else {
                // If no tab is selected, default to the first available tab
                var rootNode = instance.get_node('#');
                if (rootNode && rootNode.children_d) {
                    var firstTab = rootNode.children_d.find(id => {
                        var node = instance.get_node(id);
                        return node && node.type === 'tab';
                    });
                    if (firstTab) {
                        instance.select_node(firstTab);
                        let path = getPathToNode(firstTab);
                        $('#selectedTabDisplay').text(`Selected Tab: [${path}]`);
                        setTimeout(() => {
                            scrollToNode(firstTab); // Auto-scroll to the first available tab with delay
                        }, 200);                        
                    } else {
                        $('#selectedTabDisplay').text('Selected Tab: None');
                    }
                }
            }
        }.bind(this)); // Ensures info is saved

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

        // Add the 'Open' button next to the 'Selected Tab' display
        $('#editButtonContainer').append(createEditButton());
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
})();
