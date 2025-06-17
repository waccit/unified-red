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

var injectedStyles = `
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
        padding-left: 7px !important;
    }
`;

var clipboard = '';

var ignoreVisibilityChange = true;

(function () {
    function injectJsTreeStyles() {
        if (document.getElementById('ur-jstree-styles')) {
            return; // Styles already injected
        }
        const style = document.createElement('style');
        style.id = 'ur-jstree-styles';
        style.textContent = injectedStyles;
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
            treeInstance._open_to(nodeId);
            setTimeout(() => {
                node[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
        }
    }

    function generatePathBadges(nodeId) {
        let treeInstance = $.jstree.reference('#jstree');
        if (!treeInstance) {
            console.error('jsTree instance not available for generatePathBadges');
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

    function refreshJSTree() {
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

    function fuzzyMatch(text, searchString) {
        text = text.toLowerCase();
        searchString = searchString.toLowerCase();

        if (!searchString) return true;
        if (!text) return false;

        let searchIndex = 0;
        let score = 0;
        let consecutiveMatches = 0;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === searchString[searchIndex]) {
                // Add points for matching character
                score += 1;
                // Bonus points for consecutive matches
                consecutiveMatches++;
                score += consecutiveMatches * 0.5;
                // Bonus points for matches at start of words
                if (i === 0 || text[i - 1] === ' ') {
                    score += 2;
                }
                searchIndex++;
                if (searchIndex === searchString.length) {
                    // Normalize score based on text length to favor shorter matches
                    return score / text.length > 0.3;
                }
            } else {
                consecutiveMatches = 0;
            }
        }
        return false;
    }

    function pasteFromClipboard(node) {
        var tree = $('#jstree').jstree(true);
        const shakeButtons = () =>
            $('.jstree-hover-button').each(function (i) {
                $(this)
                    .css('position', 'relative')
                    .animate({ left: '-3px' }, 50)
                    .animate({ left: '3px' }, 100)
                    .animate({ left: '-3px' }, 100)
                    .animate({ left: '3px' }, 100)
                    .animate({ left: '0px' }, 50);
            });
        const recursiveAdd = (parentNode, currentNode, index, nodeREDID) => {
            const newNodeId = createNodeCopyPaste(
                nodeREDID,
                parentNode.type,
                index,
                currentNode.text,
                currentNode.type
            );
            if (currentNode.children && currentNode.children.length > 0) {
                currentNode.children.forEach((childId, childIndex) => {
                    const childNode = tree.get_node(childId);
                    if (childNode) {
                        recursiveAdd(currentNode, childNode, childIndex, newNodeId);
                    }
                });
            }
        };
        if (!clipboard) {
            shakeButtons();
            return;
        }
        switch (node.type) {
            case 'folder':
                if (!['link', 'folder', 'page'].includes(clipboard.type)) {
                    shakeButtons();
                    return;
                }
                break;
            case 'page':
                if (!['group'].includes(clipboard.type)) {
                    shakeButtons();
                    return;
                }
                break;
            case 'group':
                if (!['tab'].includes(clipboard.type)) {
                    shakeButtons();
                    return;
                }
                break;
            default:
                shakeButtons();
                return;
        }
        recursiveAdd(node, clipboard, node.children.length, node.id);
        refreshJSTree();
    }

    function createNodeCopyPaste(parentID, parentType, index, name, type) {
        let node_config = { ...defaultMenuEntities[`ur_${type}`] };
        node_config._def = RED.nodes.getType(node_config.type);
        node_config.id = RED.nodes.id();
        node_config.order = index;
        node_config.name = name;
        node_config[parentType] = parentID;
        RED.nodes.add(node_config);
        RED.history.push({
            t: 'add',
            nodes: [node_config.id],
            dirty: RED.nodes.dirty(),
        });
        RED.nodes.dirty(true);
        return node_config.id;
    }

    function createNodeUsingJSTree(node, type) {
        let node_config = { ...defaultMenuEntities[`ur_${type}`] };
        node_config._def = RED.nodes.getType(node_config.type);
        node_config.id = RED.nodes.id();
        node_config.order = node.children.length + 1;
        node_config.name += ` ${node.children.length + 1}`;
        node_config[node.type] = node.id;
        RED.nodes.add(node_config);
        RED.history.push({
            t: 'add',
            nodes: [node_config.id],
            dirty: RED.nodes.dirty(),
        });
        RED.nodes.dirty(true);
    }

    function initializeJsTree(tabId) {
        if ($('#jstree').length === 0) {
            console.error("Element with ID 'jstree' not found in the DOM");
            return;
        }
        const jstreeElement = document.getElementById('jstree');
        const editPane = jstreeElement.closest('.red-ui-editor');
        let lastVisibilityState = null;
        const checkVisibility = () => {
            const rect = jstreeElement.getBoundingClientRect();
            const isVisible = rect.width > 0 && 
                            rect.height > 0 && 
                            window.getComputedStyle(jstreeElement).display !== 'none' &&
                            window.getComputedStyle(jstreeElement).visibility !== 'hidden';

            if (isVisible !== lastVisibilityState) {
                lastVisibilityState = isVisible;
                if (isVisible && !ignoreVisibilityChange) {
                    refreshJSTree();
                } else {
                    ignoreVisibilityChange = false;
                }
            }
        };
        const observer = new MutationObserver(() => {
            clearTimeout(window.visibilityCheckTimeout);
            window.visibilityCheckTimeout = setTimeout(checkVisibility, 100);
        });
        observer.observe(editPane, {
            attributes: true, 
            childList: true,
            subtree: true,
        });

        selectedTab = tabId;
        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder));
        var debounce = false;

        if ($.jstree.reference('#jstree')) {
            $('#jstree').jstree('destroy');
        }

        $('#jstree').jstree({
            'core': {
                'data': foldersTreeData,
                'dblclick_toggle': false,
            },
            'multiple': false,
            'plugins': ['types', 'search', 'wholerow'],
            'types': {
                'default': {},
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
                'search_callback': function (searchString, node) {
                    return fuzzyMatch(node.text, searchString);
                },
            },
        });

        $('#jstree').on('select_node.jstree', function (e, data) {
            if (data.node.type === 'tab') {
                selectedTab = data.node;
                $('#selectedTabDisplay').html(generatePathBadges(selectedTab.id));
                $('#jstree').removeClass('input-error');
            } else {
                var instance = $.jstree.reference('#jstree');
                if (instance.is_open(data.node)) {
                    instance.close_node(data.node);
                } else {
                    instance.open_node(data.node);
                }
                instance.deselect_node(data.node);
                if (selectedTab) {
                    instance.select_node(selectedTab.id);
                }
            }
        });

        $('#treeSearch').keyup(function () {
            if (debounce) {
                clearTimeout(debounce);
            }
            debounce = setTimeout(function () {
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
            const addButtonHTML = (icon) => {
                return `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button" style="float: right; z-index: 1000; margin-top:2px"> <i class="fa fa-plus"></i> <i class="fa fa-${icon}"></i> </a>`;
            };
            const actionButtonHTML = (icon) => {
                return `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button" style="float: right; z-index: 1000; margin-top:2px"><i class="fa fa-${icon}"></i> </a>`;
            };

            const addButton = (icon, type) => {
                let btn = $(addButtonHTML(icon));
                btn.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    createNodeUsingJSTree(data.node, type);
                    refreshJSTree();
                });
                return btn;
            };

            let editButton = $(actionButtonHTML('pencil'));
            editButton.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                let tabNode = RED.nodes.node(data.node.id);
                if (tabNode) {
                    RED.editor.editConfig('', tabNode.type, tabNode.id);
                }
            });
            buttons.push(editButton);

            if (['folder', 'page', 'group'].includes(data.node.type)) {
                let pasteButton = $(actionButtonHTML('paste'));
                pasteButton.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    pasteFromClipboard(data.node);
                });
                buttons.push(pasteButton);
            }

            let copyButton = $(actionButtonHTML('copy'));
            copyButton.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                clipboard = data.node;
            });
            buttons.push(copyButton);

            switch (data.node.type) {
                case 'folder':
                    buttons.push(
                        addButton('file-o', 'page'),
                        addButton('folder-o', 'folder'),
                        addButton('link', 'link')
                    );
                    break;
                case 'page':
                    buttons.push(addButton('window-maximize', 'group'));
                    break;
                case 'group':
                    buttons.push(addButton('columns', 'tab'));
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
                        $('#selectedTabDisplay').html(generatePathBadges(selectedNode.id));
                        setTimeout(() => {
                            scrollToNode(tabId);
                        }, 200);
                    } else {
                        $('#selectedTabDisplay').html(generatePathBadges(null));
                    }
                }
            }.bind(this)
        );

        if (tabId) {
            var instance = $.jstree.reference('#jstree');
            if (instance) {
                var storedNode = instance.get_node(tabId);
                if (storedNode) {
                    $('#selectedTabDisplay').html(generatePathBadges(storedNode.id));
                } else {
                    $('#selectedTabDisplay').html(generatePathBadges(null));
                }
            }
        } else {
            $('#selectedTabDisplay').html(generatePathBadges(null));
            $('#jstree').addClass('input-error');
        }
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
})();
