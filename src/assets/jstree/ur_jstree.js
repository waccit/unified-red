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
        max-width: 70% !important;
    }
    #nodeeditjstree.jstree-parent-picker ul.jstree-container-ul.jstree-children.jstree-wholerow-ul.jstree-no-dots {
        max-width: 100% !important;
    }
    .jstree-anchor {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        max-width: calc(100% - 50px) !important;
        display: inline-block !important;
        outline: none !important;
        box-shadow: none !important;
    }
    .jstree-anchor:focus {
        outline: none !important;
        box-shadow: none !important;
    }
    .jstree-clicked {
        outline: none !important;
        box-shadow: none !important;
    }
    .badge {
        display: inline-block;
        padding: 0.25em 0.6em;
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        border-radius: 0.375rem;
        margin-right: 0.25rem;
        border: 1px solid #aaa;
    }
    .badge-standard {
        color: #555;
        background-color: #f4f4f4;
        border-color: #c8c8c8;
    }
    .badge-selected {
        color: #1a4a6e;
        background-color: #e3f2fd;
        border-color: #64b5f6;
    }
    .badge-none {
        color: #3a3a3a;
        background-color: #f5d0d0;
        border-color: #c4a0a0;
    }
    /* Align node-editor label with breadcrumb + edit button (form-row is flex in Node-RED) */
    .form-row:has([id$='-summary-display']) {
        align-items: center;
    }
    ul.jstree-children {
        margin-left: 10px !important;
        padding-left: 0 !important;
    }
    li.jstree-node {
        margin-left: 0 !important;
        padding-left: 7px !important;
    }
    #vakata-dnd {
        font-family: 'Arial', sans-serif !important;
        font-size: 14px !important;
        font-weight: normal !important;
        color: #333 !important;
        background-color: #fff !important;
        border: 2px solid #ccecff !important;
        border-radius: 5px !important;
        padding-right: 5px !important;
    }
    
    /* Replace jstree-er icon in drag preview with Font Awesome fa-columns */
    #vakata-dnd .jstree-icon.jstree-er {
        font-family: 'FontAwesome' !important;
        font-size: 14px !important;
    }
        
    #vakata-dnd .jstree-icon.jstree-er:before {
        content: "\f0db" !important; /* Font Awesome fa-columns icon */
        font-family: 'FontAwesome' !important;
    }
    #jstree-marker {
        z-index: 5555;
    }
    .jstree-disabled {
        opacity: 0.5;
        pointer-events: none;
    }
    .jstree-cut {
        opacity: 0.5;
    }
    
    /* Hover button styles with visual feedback */
    .jstree-hover-button {
        transition: background-color 0.15s ease-in-out, opacity 0.15s ease-in-out;
        background-color: #fff !important;
    }
    
    .jstree-hover-button:hover {
        background-color: #e6e6e6 !important;
        opacity: 1 !important;
    }
    
    .jstree-hover-button:active {
        background-color: #f2f2f2 !important;
        transform: scale(0.98);
    }

    /* Done button hover: darken the primary red */
    .ur-jstree-done-btn:hover {
        filter: brightness(0.82) !important;
    }

    /* Table link path: left when it fits; right-justify + left-edge fade when clipped */
    .ur-table-link-path-outer {
        position: relative;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-height: 22px;
    }
    .ur-table-link-path-outer.ur-table-link-path-overflow {
        justify-content: flex-end;
    }
    .ur-table-link-path-outer.ur-table-link-path-overflow::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 40px;
        z-index: 2;
        pointer-events: none;
        background: linear-gradient(
            90deg,
            var(--red-ui-form-background, var(--red-ui-secondary-background, #ffffff)) 0%,
            transparent 100%
        );
    }
    /* Same inline layout as #ur-*-summary-display (block container; badges keep default .badge margins) */
    .ur-table-link-path-inner {
        flex: 0 0 auto;
        display: inline-block;
        white-space: nowrap;
        vertical-align: middle;
    }
`;

var clipboard = null;
var cutNodes = new Set();

var ignoreVisibilityChange = true;

/**
 * Creates a new node of the specified type with proper numbering.
 * Counts existing nodes from RED.nodes to ensure unique sequential names.
 * This function is exposed globally for use by ur_base.html and other scripts.
 *
 * @param {string} type - Node type without 'ur_' prefix (folder, link, page, group, tab)
 * @param {string|null} parentId - ID of the parent node (null for root-level items)
 * @param {string|null} parentType - Type of the parent without 'ur_' prefix (folder, page, group)
 * @returns {Object} The created node configuration
 */
function createMenuNode(type, parentId, parentType) {
    let node_config = { ...defaultMenuEntities[`ur_${type}`] };
    node_config._def = RED.nodes.getType(node_config.type);
    node_config.id = RED.nodes.id();

    // Count existing nodes for proper ordering and naming
    // - existingTypeCount: count of same-type nodes (for naming: "Folder 1", "Folder 2")
    // - existingSiblingCount: count of ALL sibling nodes (for order: sequential position)
    let existingTypeCount = 0;
    let existingSiblingCount = 0;

    RED.nodes.eachConfig(function (node) {
        if (type === 'folder' || type === 'link') {
            if (parentId) {
                // Nested in a folder - count items in that folder
                if (node.folder === parentId) {
                    existingSiblingCount++;
                    if (node.type === `ur_${type}`) {
                        existingTypeCount++;
                    }
                }
            } else {
                // Root level - count ALL root-level folders and links for order
                if ((node.type === 'ur_folder' || node.type === 'ur_link') && !node.folder) {
                    existingSiblingCount++;
                    if (node.type === `ur_${type}`) {
                        existingTypeCount++;
                    }
                }
            }
        } else if (type === 'page') {
            // Pages inside a folder - also count child folders and links as siblings
            if (node.folder === parentId) {
                existingSiblingCount++;
                if (node.type === 'ur_page') {
                    existingTypeCount++;
                }
            }
        } else if (type === 'group') {
            if (node.page === parentId) {
                existingSiblingCount++;
                if (node.type === 'ur_group') {
                    existingTypeCount++;
                }
            }
        } else if (type === 'tab') {
            if (node.group === parentId) {
                existingSiblingCount++;
                if (node.type === 'ur_tab') {
                    existingTypeCount++;
                }
            }
        }
    });

    // Order is sequential across all siblings to maintain insertion order
    node_config.order = existingSiblingCount + 1;
    // Name is numbered by type (Folder 1, Folder 2, Link 1, etc.)
    node_config.name += ` ${existingTypeCount + 1}`;

    // Set the parent reference
    if (parentId && parentType) {
        node_config[parentType] = parentId;
    }

    RED.nodes.add(node_config);
    RED.history.push({
        t: 'add',
        nodes: [node_config.id],
        dirty: RED.nodes.dirty(),
    });
    RED.nodes.dirty(true);

    return node_config;
}

/**
 * Add a new folder. Can be root-level or nested inside another folder.
 * @param {string|null} parentFolderId - Parent folder ID, or null/undefined for root-level
 * @returns {Object} The created node configuration
 */
function addFolder(parentFolderId) {
    return createMenuNode('folder', parentFolderId || null, parentFolderId ? 'folder' : null);
}

/**
 * Add a new link. Can be root-level or nested inside a folder.
 * @param {string|null} parentFolderId - Parent folder ID, or null/undefined for root-level
 * @returns {Object} The created node configuration
 */
function addLink(parentFolderId) {
    return createMenuNode('link', parentFolderId || null, parentFolderId ? 'folder' : null);
}

/**
 * Add a new page inside a folder.
 * @param {string} folderId - Parent folder ID (required)
 * @returns {Object} The created node configuration
 */
function addPage(folderId) {
    return createMenuNode('page', folderId, 'folder');
}

/**
 * Add a new group inside a page.
 * @param {string} pageId - Parent page ID (required)
 * @returns {Object} The created node configuration
 */
function addGroup(pageId) {
    return createMenuNode('group', pageId, 'page');
}

/**
 * Add a new tab inside a group.
 * @param {string} groupId - Parent group ID (required)
 * @returns {Object} The created node configuration
 */
function addTab(groupId) {
    return createMenuNode('tab', groupId, 'group');
}

// Expose node creation functions globally for use by ur_base.html
window.addFolder = addFolder;
window.addLink = addLink;
window.addPage = addPage;
window.addGroup = addGroup;
window.addTab = addTab;
window.createMenuNode = createMenuNode;

(function () {
    var selectedTab = null;
    /** ur_table "link" field page picker; never use for getSelectedTab() (see mode: 'tablePage') */
    var selectedTablePage = null;
    var nodeEditJSTreeOptions = null; // { mode: 'tab'|'parent'|'tablePage', parentType?: 'folder'|'page'|'group', allowRoot?: boolean }
    var selectedRefPage = null;
    var refPageTreeOptions = null; // { onChange, displayLabel, selfPageId }

    function injectJsTreeStyles() {
        if (document.getElementById('ur-jstree-styles')) {
            return;
        }
        const style = document.createElement('style');
        style.id = 'ur-jstree-styles';
        style.textContent = injectedStyles;
        document.head.appendChild(style);
    }

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
        return nodesArray.sort((a, b) => a.order - b.order);
    }

    function getWidgetNodeDisplayText(node) {
        return node.label || node.name || node.type;
    }

    function getNodeDisplayText(name, redNode) {
        if (redNode && redNode.hidden) {
            return '<s>' + name + '</s>';
        }
        return name;
    }

    /** Strips display markup from jstree `text` so search matches the visible name. */
    function plainTextForJstreeSearch(node) {
        var t = node && node.text != null ? String(node.text) : '';
        return t.replace(/<[^>]*>/g, '');
    }

    /**
     * Truncation + hidden styling for path/badge labels (uses plain RED name, not raw jstree text).
     */
    function badgeLabelHtmlForJstreeNode(jstreeNode) {
        if (!jstreeNode || jstreeNode.id == null) {
            return '';
        }
        var n = RED.nodes.node(jstreeNode.id);
        if (n) {
            var base = n.name != null && n.name !== '' ? n.name : n.label != null && n.label !== '' ? n.label : '';
            if (base === '' && n.type) {
                base = n.type;
            }
            var t = String(base);
            t = t.length > 25 ? t.slice(0, 25) + '...' : t;
            return getNodeDisplayText(t, n);
        }
        if (jstreeNode.id === 'root') {
            return 'ROOT';
        }
        if (jstreeNode.id === 'none') {
            return 'None';
        }
        var fall = jstreeNode.text != null ? String(jstreeNode.text) : '';
        fall = fall.replace(/<[^>]*>/g, '');
        return fall.length > 25 ? fall.slice(0, 25) + '...' : fall;
    }

    function extractFolderChildren(folderNode, includeWidgets) {
        const folder = {
            text: getNodeDisplayText(folderNode.name, folderNode),
            id: folderNode.id,
            type: folderNode.type === 'ur_folder' ? 'folder' : 'link',
            children: [],
        };
        extractNodesFromConfig('ur_page', 'folder', folderNode).forEach((page) => {
            // Determine icon based on page type (inherited/multi get different icons)
            // All pages use type: 'page' for consistent behavior
            let pageIcon = 'fa fa-file-o'; // default single page icon
            if (page.pageType === 'inherited') {
                pageIcon = 'fa fa-paste';
            } else if (page.pageType === 'multi' || page.isMulti) {
                pageIcon = 'fa fa-copy';
            }
            const pageNode = {
                text: getNodeDisplayText(page.name, page),
                id: page.id,
                type: 'page',
                icon: pageIcon,
                children: [],
            };
            extractNodesFromConfig('ur_group', 'page', page).forEach((group) => {
                const groupNode = {
                    text: getNodeDisplayText(group.name, group),
                    id: group.id,
                    type: 'group',
                    children: extractNodesFromConfig('ur_tab', 'group', group).map((tab) => {
                        const tabNode = {
                            text: getNodeDisplayText(tab.name, tab),
                            id: tab.id,
                            type: 'tab',
                            children: [],
                        };

                        // Only add widgets if explicitly requested (for base tree)
                        if (includeWidgets) {
                            RED.nodes.eachNode(function (node) {
                                if (/^ur_/.test(node.type) && node.tab === tab.id) {
                                    tabNode.children.push({
                                        text: getWidgetNodeDisplayText(node),
                                        id: node.id,
                                        order: node.order,
                                        type: 'widget',
                                    });
                                }
                            });
                        }
                        tabNode.children.sort((a, b) => a.order - b.order);

                        return tabNode;
                    }),
                };
                pageNode.children.push(groupNode);
            });
            folder.children.push(pageNode);
        });

        extractNodesFromConfig('ur_link', 'folder', folderNode).forEach((link) => {
            folder.children.push({
                text: getNodeDisplayText(link.name, link),
                id: link.id,
                type: 'link',
            });
        });

        extractNodesFromConfig('ur_folder', 'folder', folderNode).forEach((childFolder) => {
            folder.children.push(extractFolderChildren(childFolder, includeWidgets));
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
            if (node.type === 'ur_link' && (!node.folder || node.folder === 'root')) {
                rootLinksArray.push(node);
            }
        });

        return [...rootFoldersArray, ...rootLinksArray].sort((a, b) => a.order - b.order);
    }

    /**
     * Build tree data for parent selector: only folders (nested), no pages/links/groups/tabs.
     * @param {boolean} allowRoot - If true, prepend a selectable ROOT node
     * @param {string|null} excludeNodeId - Folder id to exclude (e.g. the folder being edited)
     * @returns {Array} jstree data
     */
    function extractTreeForParentFolder(allowRoot, excludeNodeId) {
        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder && node.id !== excludeNodeId) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        function folderOnlyChildren(folderNode) {
            var childFolders = extractNodesFromConfig('ur_folder', 'folder', folderNode).filter(function (n) {
                return n.id !== excludeNodeId;
            });
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: childFolders.map(folderOnlyChildren),
            };
        }

        var data = [];
        if (allowRoot) {
            data.push({ id: 'root', text: 'ROOT', type: 'root', icon: 'fa fa-home', children: [] });
        }
        rootFolders.forEach(function (f) {
            data.push(folderOnlyChildren(f));
        });
        return data;
    }

    /**
     * Build tree data for parent selector: folders with pages only (no groups/tabs).
     * Selectable = folder (when choosing parent for page) or page (when choosing parent for group).
     * @param {string|null} excludeNodeId - Page id to exclude when editing a group (the group's current page)
     * @returns {Array} jstree data
     */
    function extractTreeForParentPage(excludeNodeId) {
        excludeNodeId = excludeNodeId || null;
        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        function folderWithPagesOnly(folderNode) {
            var pages = extractNodesFromConfig('ur_page', 'folder', folderNode).filter(function (p) {
                return p.id !== excludeNodeId;
            });
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: pages.map(function (page) {
                    return {
                        text: getNodeDisplayText(page.name, page),
                        id: page.id,
                        type: 'page',
                        icon: page.pageType === 'inherited' ? 'fa fa-paste' : page.pageType === 'multi' || page.isMulti ? 'fa fa-copy' : 'fa fa-file-o',
                        children: [],
                    };
                }),
            };
        }

        return rootFolders.map(folderWithPagesOnly);
    }

    /**
     * Build tree data for parent selector: nested folders, each folder has its pages as children.
     * Use when editing a group (select a page) so the full folder hierarchy is visible.
     * @param {string|null} excludeNodeId - Page id to exclude when editing a group (the group's current page)
     * @returns {Array} jstree data
     */
    function extractTreeForParentPageNested(excludeNodeId) {
        excludeNodeId = excludeNodeId || null;
        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        function folderWithPagesAndNestedFolders(folderNode) {
            var pages = extractNodesFromConfig('ur_page', 'folder', folderNode).filter(function (p) {
                return p.id !== excludeNodeId;
            });
            var childFolders = extractNodesFromConfig('ur_folder', 'folder', folderNode);
            var pageNodes = pages.map(function (page) {
                return {
                    text: getNodeDisplayText(page.name, page),
                    id: page.id,
                    type: 'page',
                    icon: page.pageType === 'inherited' ? 'fa fa-paste' : page.pageType === 'multi' || page.isMulti ? 'fa fa-copy' : 'fa fa-file-o',
                    children: [],
                };
            });
            var folderNodes = childFolders.map(folderWithPagesAndNestedFolders);
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: pageNodes.concat(folderNodes),
            };
        }

        return rootFolders.map(folderWithPagesAndNestedFolders);
    }

    /**
     * Build tree data for parent selector: folders → pages → groups (no tabs).
     * Selectable = group (parent of a tab).
     * @param {string|null} excludeNodeId - Group id to exclude (e.g. the tab's current group when editing a tab)
     * @returns {Array} jstree data
     */
    function extractTreeForParentGroup(excludeNodeId) {
        excludeNodeId = excludeNodeId || null;
        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        function folderWithPagesAndGroups(folderNode) {
            var pages = extractNodesFromConfig('ur_page', 'folder', folderNode);
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: pages.map(function (page) {
                    var groups = extractNodesFromConfig('ur_group', 'page', page).filter(function (g) {
                        return g.id !== excludeNodeId;
                    });
                    return {
                        text: getNodeDisplayText(page.name, page),
                        id: page.id,
                        type: 'page',
                        icon: page.pageType === 'inherited' ? 'fa fa-paste' : page.pageType === 'multi' || page.isMulti ? 'fa fa-copy' : 'fa fa-file-o',
                        children: groups.map(function (group) {
                            return {
                                text: getNodeDisplayText(group.name, group),
                                id: group.id,
                                type: 'group',
                                icon: 'fa fa-window-maximize',
                                children: [],
                            };
                        }),
                    };
                }),
            };
        }

        return rootFolders.map(folderWithPagesAndGroups);
    }

    /**
     * Build tree data for parent selector: nested folders, each folder has pages (with groups).
     * Use when editing a tab (select a group) so the full folder hierarchy is visible.
     * @param {string|null} excludeNodeId - Group id to exclude (the tab's current group)
     * @returns {Array} jstree data
     */
    function extractTreeForParentGroupNested(excludeNodeId) {
        excludeNodeId = excludeNodeId || null;
        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        function folderWithPagesAndGroupsNested(folderNode) {
            var pages = extractNodesFromConfig('ur_page', 'folder', folderNode);
            var childFolders = extractNodesFromConfig('ur_folder', 'folder', folderNode);
            var pageNodes = pages.map(function (page) {
                var pageId = page.id;
                var groups = [];
                RED.nodes.eachConfig(function (node) {
                    if (node.type === 'ur_group' && node.page == pageId) {
                        groups.push(node);
                    }
                });
                groups = groups.sort(function (a, b) { return a.order - b.order; });
                return {
                    text: getNodeDisplayText(page.name, page),
                    id: pageId,
                    type: 'page',
                    icon: page.pageType === 'inherited' ? 'fa fa-paste' : page.pageType === 'multi' || page.isMulti ? 'fa fa-copy' : 'fa fa-file-o',
                    children: groups.map(function (group) {
                        return {
                            text: getNodeDisplayText(group.name, group),
                            id: group.id,
                            type: 'group',
                            icon: 'fa fa-window-maximize',
                            children: [],
                        };
                    }),
                };
            });
            var folderNodes = childFolders.map(folderWithPagesAndGroupsNested);
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: pageNodes.concat(folderNodes),
            };
        }

        return rootFolders.map(folderWithPagesAndGroupsNested);
    }

    /**
     * Tree for inherited page "referenced page" picker: same nested layout as group page
     * selection, but only non-inherited pages, same workspace, excluding self. Includes a
     * root-level "None" node (id: none, type: ref-none).
     */
    function extractTreeForRefPage(selfPageId) {
        var activeWorkspace = RED.nodes.workspace(RED.workspaces.active());
        if (!activeWorkspace) {
            activeWorkspace = RED.nodes.subflow(RED.workspaces.active());
        }
        var workspaceId = activeWorkspace ? activeWorkspace.id : null;

        function pageIsSelectable(page) {
            if (!page || page.id === selfPageId) {
                return false;
            }
            if (page.pageType === 'inherited') {
                return false;
            }
            if (page.z && workspaceId && page.z !== workspaceId) {
                return false;
            }
            return true;
        }

        function folderWithPagesAndNestedFolders(folderNode) {
            var pages = extractNodesFromConfig('ur_page', 'folder', folderNode).filter(pageIsSelectable);
            var childFolders = extractNodesFromConfig('ur_folder', 'folder', folderNode);
            var pageNodes = pages.map(function (page) {
                return {
                    text: getNodeDisplayText(page.name, page),
                    id: page.id,
                    type: 'page',
                    icon: page.pageType === 'inherited' ? 'fa fa-paste' : page.pageType === 'multi' || page.isMulti ? 'fa fa-copy' : 'fa fa-file-o',
                    children: [],
                };
            });
            var folderNodes = childFolders.map(folderWithPagesAndNestedFolders);
            return {
                text: getNodeDisplayText(folderNode.name, folderNode),
                id: folderNode.id,
                type: 'folder',
                icon: 'fa fa-folder-o',
                children: pageNodes.concat(folderNodes),
            };
        }

        var rootFolders = [];
        RED.nodes.eachConfig(function (node) {
            if (node.type === 'ur_folder' && !node.folder) {
                rootFolders.push(node);
            }
        });
        rootFolders.sort((a, b) => a.order - b.order);

        var data = rootFolders.map(folderWithPagesAndNestedFolders);
        return [
            { id: 'none', text: 'None', type: 'ref-none', icon: 'fa fa-ban', children: [] },
        ].concat(data);
    }

    function getNavConfigPathText(configId) {
        if (!configId) {
            return '';
        }
        var n = RED.nodes.node(configId);
        if (!n) {
            return '';
        }
        if (n.type === 'ur_link') {
            var names = [n.name || n.label || 'link'];
            var f = n.folder;
            while (f && f !== 'root' && f !== 'Root') {
                var fn = RED.nodes.node(f);
                if (!fn) {
                    break;
                }
                names.unshift(fn.name || f);
                f = fn.folder;
            }
            return names.join(' / ');
        }
        if (n.type === 'ur_page') {
            return (n.name || n.id) + ' (page)';
        }
        return n.name || String(configId);
    }

    /**
     * Build tree data for parent selector. Shows only nodes up to parent level.
     * @param {string} parentType - 'folder' | 'page' | 'group' (type of the parent entity to select)
     * @param {boolean} allowRoot - For parentType 'folder' only: include selectable ROOT node
     * @param {string|null} excludeNodeId - For folder only: folder id to exclude from options
     * @returns {Array} jstree data
     */
    function extractTreeForParentSelection(parentType, allowRoot, excludeNodeId) {
        if (parentType === 'folder') {
            return extractTreeForParentFolder(allowRoot === true, excludeNodeId || null);
        }
        if (parentType === 'page') {
            return extractTreeForParentFolder(false, null);
        }
        if (parentType === 'group') {
            return extractTreeForParentPageNested(excludeNodeId || null);
        }
        if (parentType === 'tab') {
            return extractTreeForParentGroupNested(excludeNodeId || null);
        }
        return [];
    }

    function scrollToNode(nodeId, treeSelector) {
        treeSelector = treeSelector || '#nodeeditjstree';
        let treeInstance = $.jstree.reference(treeSelector);
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

    function getParentSelectorLabel() {
        if (nodeEditJSTreeOptions && nodeEditJSTreeOptions.mode === 'tablePage') {
            return 'Selected Page';
        }
        if (!nodeEditJSTreeOptions || nodeEditJSTreeOptions.mode !== 'parent') {
            return 'Selected Tab';
        }
        var t = nodeEditJSTreeOptions.parentType;
        if (t === 'folder') return 'Selected Parent';
        if (t === 'page') return 'Selected Folder';
        if (t === 'group') return 'Selected Page';
        if (t === 'tab') return 'Selected Group';
        return 'Selected Parent';
    }

    function getParentSelectorIcon() {
        if (nodeEditJSTreeOptions && nodeEditJSTreeOptions.mode === 'tablePage') {
            return 'fa fa-file-o';
        }
        if (!nodeEditJSTreeOptions || nodeEditJSTreeOptions.mode !== 'parent') {
            return 'fa fa-columns';
        }
        var t = nodeEditJSTreeOptions.parentType;
        if (t === 'folder' || t === 'page') return 'fa fa-folder-o';
        if (t === 'group') return 'fa fa-file-o';
        if (t === 'tab') return 'fa fa-window-maximize';
        return 'fa fa-folder-o';
    }

    /**
     * Renders the breadcrumb row (badges + chevrons) used in the path display and the table link field.
     * @param {Array<{ node: object, badgeBody: string }>} pathSegments
     * @returns {string} HTML
     */
    function formatPathSegmentBadges(pathSegments) {
        if (!pathSegments || !pathSegments.length) {
            return '<span class="badge badge-none">None</span>';
        }
        var lastIdx = pathSegments.length - 1;
        var pathArray = pathSegments.map(function (seg, i) {
            var badgeClass = i === lastIdx ? 'selected' : 'standard';
            return (
                '<span class="badge badge-' +
                badgeClass +
                '"><i class="' +
                (seg.node.icon || '') +
                '"></i> ' +
                seg.badgeBody +
                '</span>'
            );
        });
        return pathArray.join(
            ' <i class="fa fa-chevron-right" style="font-size:0.7em;vertical-align:middle"></i> '
        );
    }

    function generatePathBadges(nodeId) {
        let treeInstance = $.jstree.reference('#nodeeditjstree');
        if (!treeInstance) {
            console.error('jsTree instance not available for generatePathBadges');
            return '<span class="badge badge-none">None</span>';
        }

        let currentNode = nodeId ? treeInstance.get_node(nodeId) : null;
        var label = getParentSelectorLabel();
        var labelIcon = getParentSelectorIcon();
        if (!currentNode) {
            return `<i class="${labelIcon}"></i> ${label}: <span class="badge badge-none">None</span>`;
        }

        let pathSegments = [];
        while (currentNode && currentNode.id !== '#') {
            const badgeBody = badgeLabelHtmlForJstreeNode(currentNode);
            pathSegments.unshift({ node: currentNode, badgeBody: badgeBody });
            currentNode = treeInstance.get_node(currentNode.parent);
        }
        return `<i class="${labelIcon}"></i> ${label}: ${formatPathSegmentBadges(pathSegments)}`;
    }

    /**
     * Breadcrumb for ur_table "link" column: folders + page (match picker). No jstree required.
     */
    function getFormSummaryPathHtmlForTablePageId(configId) {
        if (!configId) {
            return formatPathSegmentBadges(null);
        }
        var n = RED.nodes.node(configId);
        if (!n) {
            return formatPathSegmentBadges(null);
        }
        if (n.type === 'ur_page') {
            var pathSegs = [];
            var f = n.folder;
            var folderList = [];
            while (f && f !== 'root' && f !== 'Root') {
                var fn2 = RED.nodes.node(f);
                if (!fn2) {
                    break;
                }
                folderList.unshift(fn2);
                f = fn2.folder;
            }
            folderList.forEach(function (fn) {
                var fj = { id: fn.id, type: 'folder', icon: 'fa fa-folder-o' };
                pathSegs.push({ node: fj, badgeBody: badgeLabelHtmlForJstreeNode(fj) });
            });
            var pageIcon = 'fa fa-file-o';
            if (n.pageType === 'inherited') {
                pageIcon = 'fa fa-paste';
            } else if (n.pageType === 'multi' || n.isMulti) {
                pageIcon = 'fa fa-copy';
            }
            var pj = { id: n.id, type: 'page', icon: pageIcon };
            pathSegs.push({ node: pj, badgeBody: badgeLabelHtmlForJstreeNode(pj) });
            return formatPathSegmentBadges(pathSegs);
        }
        return formatPathSegmentBadges(null);
    }

    var REF_PAGE_TREE = '#refPageJstree';
    var REF_PAGE_SEARCH = '#refPageTreeSearch';
    var REF_PAGE_DISPLAY = '#refPageSelectedDisplay';

    function generateRefPagePathBadges(nodeId) {
        var displayLabel = (refPageTreeOptions && refPageTreeOptions.displayLabel) || 'Referenced Page';
        var treeInstance = $.jstree.reference(REF_PAGE_TREE);
        if (!treeInstance) {
            return (
                '<i class="fa fa-file-text-o"></i> ' +
                displayLabel +
                ': <span class="badge badge-none">None</span>'
            );
        }
        if (!nodeId || nodeId === 'none') {
            return (
                '<i class="fa fa-file-text-o"></i> ' +
                displayLabel +
                ': <span class="badge badge-none">None</span>'
            );
        }

        let currentNode = treeInstance.get_node(nodeId);
        if (!currentNode) {
            return (
                '<i class="fa fa-file-text-o"></i> ' +
                displayLabel +
                ': <span class="badge badge-none">None</span>'
            );
        }

        let refPathSegments = [];
        while (currentNode && currentNode.id !== '#') {
            const badgeBody = badgeLabelHtmlForJstreeNode(currentNode);
            refPathSegments.unshift({ node: currentNode, badgeBody: badgeBody });
            currentNode = treeInstance.get_node(currentNode.parent);
        }
        var refLastIdx = refPathSegments.length - 1;
        let pathArray = refPathSegments.map(function (seg, i) {
            var badgeClass = i === refLastIdx ? 'selected' : 'standard';
            return (
                '<span class="badge badge-' +
                badgeClass +
                '"><i class="' +
                (seg.node.icon || '') +
                '"></i> ' +
                seg.badgeBody +
                '</span>'
            );
        });

        return (
            '<i class="fa fa-file-text-o"></i> ' +
            displayLabel +
            ': ' +
            pathArray.join(' <i class="fa fa-chevron-right" style="font-size:0.7em;vertical-align:middle"></i> ')
        );
    }

    function refreshJSTree() {
        var $nodeeditjstree = $('#nodeeditjstree');
        var instance = $.jstree.reference($nodeeditjstree);
        if (!instance) {
            console.error('jsTree instance not available for updateJsTreeData');
            return;
        }

        // Get fresh data
        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder, false));

        // Update the data source and refresh in-place (preserves open state)
        instance.settings.core.data = foldersTreeData;
        instance.refresh(true); // true = skip loading indicator
    }

    function applyCutClasses() {
        // Clean up orphaned cut nodes (when clipboard is cleared externally)
        if (!clipboard && cutNodes.size > 0) {
            cutNodes.forEach((nodeId) => {
                // Scope to jstree containers to avoid affecting Node-RED flow editor
                $('#nodeeditjstree, #jstree')
                    .find('#' + nodeId.replace(/\./g, '\\.'))
                    .removeClass('jstree-cut');
            });
            cutNodes.clear();
            return;
        }

        cutNodes.forEach((nodeId) => {
            // Scope to jstree containers to avoid affecting Node-RED flow editor
            $('#nodeeditjstree, #jstree')
                .find('#' + nodeId.replace(/\./g, '\\.'))
                .addClass('jstree-cut');
        });
    }

    // Helper function to clear both clipboard and cut nodes together
    function clearClipboard() {
        if (clipboard && cutNodes.has(clipboard.id)) {
            // Try to get instance from either tree
            var instance = $.jstree.reference('#nodeeditjstree') || $.jstree.reference('#jstree');
            const removeCutFromChildren = (currentNode) => {
                cutNodes.delete(currentNode.id);
                // Scope to jstree containers to avoid affecting Node-RED flow editor

                $('#nodeeditjstree, #jstree')
                    .find('#' + currentNode.id.replace(/\./g, '\\.'))
                    .removeClass('jstree-cut');
                if (currentNode.children && currentNode.children.length > 0) {
                    currentNode.children.forEach((childId) => {
                        const childNode = instance ? instance.get_node(childId) : null;
                        if (childNode) removeCutFromChildren(childNode);
                    });
                }
            };
            removeCutFromChildren(clipboard);
        }
        clipboard = null;
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
                score += 1;
                consecutiveMatches++;
                score += consecutiveMatches * 0.5;
                if (i === 0 || text[i - 1] === ' ') {
                    score += 2;
                }
                searchIndex++;
                if (searchIndex === searchString.length) {
                    return score / text.length > 0.3;
                }
            } else {
                consecutiveMatches = 0;
            }
        }
        return false;
    }

    function shakeButtons() {
        $('.jstree-hover-button').each(function (i) {
            $(this)
                .css('position', 'relative')
                .animate({ left: '-3px' }, 50)
                .animate({ left: '3px' }, 100)
                .animate({ left: '-3px' }, 100)
                .animate({ left: '3px' }, 100)
                .animate({ left: '0px' }, 50);
        });
    }

    function cutNode(node, treeSelector) {
        treeSelector = treeSelector || '#nodeeditjstree';
        var instance = $.jstree.reference(treeSelector);
        if (!instance) {
            console.error('jsTree instance not available for cutNode');
            return;
        }

        const addCutToNodeAndChildren = (currentNode) => {
            cutNodes.add(currentNode.id);
            // Scope to jstree containers to avoid affecting Node-RED flow editor
            $('#nodeeditjstree, #jstree')
                .find('#' + currentNode.id.replace(/\./g, '\\.'))
                .addClass('jstree-cut');
            if (currentNode.children && currentNode.children.length > 0) {
                currentNode.children.forEach((childId) => {
                    const childNode = instance.get_node(childId);
                    if (childNode) {
                        addCutToNodeAndChildren(childNode);
                    }
                });
            }
        };

        // Only check selectedTab restrictions when in nodeeditjstree context and selectedTab exists
        // This prevents cutting nodes that are parents of or equal to the currently selected tab
        if (typeof selectedTab !== 'undefined' && selectedTab && treeSelector === '#nodeeditjstree') {
            if (selectedTab.parents && selectedTab.parents.includes(node.id)) {
                shakeButtons();
                return;
            }
            if (selectedTab.id === node.id) {
                shakeButtons();
                return;
            }
        }

        // Clear previous cut state if there was one
        if (clipboard && cutNodes.has(clipboard.id)) {
            const removeCutFromChildren = (currentNode) => {
                cutNodes.delete(currentNode.id);
                // Scope to jstree containers to avoid affecting Node-RED flow editor
                $('#nodeeditjstree, #jstree')
                    .find('#' + currentNode.id.replace(/\./g, '\\.'))
                    .removeClass('jstree-cut');
                if (currentNode.children && currentNode.children.length > 0) {
                    currentNode.children.forEach((childId) => {
                        const childNode = instance.get_node(childId);
                        if (childNode) {
                            removeCutFromChildren(childNode);
                        }
                    });
                }
            };
            removeCutFromChildren(clipboard);
        }

        clipboard = node;
        addCutToNodeAndChildren(node);
        instance.close_node(node);
        onHoverNode(node, treeSelector);
    }

    function pasteFromClipboard(node, treeSelector) {
        // Check for undefined clipboard first
        if (!clipboard) {
            shakeButtons();
            return;
        }

        // Use the provided tree selector, defaulting to nodeeditjstree for backward compatibility
        treeSelector = treeSelector || '#nodeeditjstree';
        var tree = $(treeSelector).jstree(true);

        // Try to get clipboard node from available trees (might be copied from different tree)
        var sourceTree = tree;
        var clipboardNode = tree ? tree.get_node(clipboard.id) : null;
        if (!clipboardNode) {
            // Try the base tree
            var baseTree = $.jstree.reference('#jstree');
            if (baseTree) {
                clipboardNode = baseTree.get_node(clipboard.id);
                if (clipboardNode) {
                    sourceTree = baseTree;
                }
            }
        }
        // Fall back to the stored clipboard reference if not found in trees
        if (!clipboardNode) {
            clipboardNode = clipboard;
        }

        // Determine if this is a CUT (move) operation
        var isCutOperation = clipboard && cutNodes.has(clipboard.id);

        // For COPY operations: create new nodes recursively
        const recursiveAdd = (parentNode, currentNode, index, nodeREDID) => {
            const newNodeId = createNodeCopyPaste(
                nodeREDID,
                parentNode.type,
                index,
                currentNode.text,
                currentNode.type,
                currentNode.id // Pass original node ID to copy properties from
            );
            if (currentNode.children && currentNode.children.length > 0) {
                currentNode.children.forEach((childId, childIndex) => {
                    // Get child from the source tree where clipboard came from
                    const childNode = sourceTree ? sourceTree.get_node(childId) : null;
                    // Skip widget nodes - they cannot be copied via jstree copy/paste
                    // Widgets are actual flow nodes and should be copied via Node-RED's native clipboard
                    if (childNode && childNode.type !== 'widget') {
                        recursiveAdd(currentNode, childNode, childIndex, newNodeId);
                    }
                });
            }
        };

        // For CUT operations: move existing nodes by updating parent references
        const recursiveMove = (newParentId, newParentType, currentNode, index) => {
            const redNode = RED.nodes.node(currentNode.id);
            if (!redNode) return;

            // Store old values for history
            const oldParentType = getParentTypeForNodeType(currentNode.type);
            const oldParentId = oldParentType ? redNode[oldParentType] : null;
            const oldOrder = redNode.order;

            // Update parent reference
            if (oldParentType && redNode[oldParentType] !== undefined) {
                if (oldParentType !== newParentType) {
                    delete redNode[oldParentType];
                }
            }
            if (newParentId === 'root' && newParentType === 'folder') {
                delete redNode.folder;
            } else {
                redNode[newParentType] = newParentId;
            }
            redNode.order = index + 1;

            // Record the change in history
            RED.history.push({
                t: 'edit',
                node: redNode,
                changed: true,
                dirty: redNode.dirty,
                changes: {
                    [oldParentType]: oldParentId,
                    [newParentType]: oldParentId, // for undo
                    order: oldOrder,
                },
            });
            RED.nodes.dirty(true);
        };

        // Helper to get the parent property name for a node type
        const getParentTypeForNodeType = (nodeType) => {
            switch (nodeType) {
                case 'folder':
                case 'link':
                case 'page':
                    return 'folder';
                case 'group':
                    return 'page';
                case 'tab':
                    return 'group';
                default:
                    return null;
            }
        };

        switch (node.type) {
            case 'folder':
                if (!['link', 'folder', 'page'].includes(clipboardNode.type)) {
                    shakeButtons();
                    return;
                }
                break;
            case 'link':
                // Paste onto link = paste into the link's parent folder (same folder as the link)
                var linkParent = tree.get_node(node.parent);
                if (!linkParent || (linkParent.type !== 'folder' && linkParent.id !== 'root')) {
                    shakeButtons();
                    return;
                }
                if (!['link', 'folder', 'page'].includes(clipboardNode.type)) {
                    shakeButtons();
                    return;
                }
                // Use parent as target; when parent is root, use type 'folder' so move/add clear folder
                node = linkParent.id === 'root' ? { id: 'root', type: 'folder', children: linkParent.children || [] } : linkParent;
                break;
            case 'page':
                if (!['group'].includes(clipboardNode.type)) {
                    shakeButtons();
                    return;
                }
                break;
            case 'group':
                if (!['tab'].includes(clipboardNode.type)) {
                    shakeButtons();
                    return;
                }
                break;
            default:
                shakeButtons();
                return;
        }

        if (isCutOperation) {
            // MOVE operation: update parent reference on existing node
            recursiveMove(node.id, node.type, clipboardNode, node.children.length);
            cutNodes.clear();
            clipboard = null;
            // Redraw Node-RED view to update widget visual state
            RED.view.redraw();
        } else {
            // COPY operation: create new nodes
            recursiveAdd(node, clipboardNode, node.children.length, node.id);
        }

        // tree is now correctly initialized based on treeSelector parameter
        if (tree && typeof tree.is_open === 'function' && !tree.is_open(node)) {
            tree.open_node(node);
        }
        // Refresh the appropriate tree(s) based on what exists
        // Only refresh nodeeditjstree if it exists and has a jstree instance
        if ($('#nodeeditjstree').length > 0 && $.jstree.reference('#nodeeditjstree')) {
            refreshJSTree();
        }
        // Only refresh base tree if it exists and has a jstree instance
        if ($('#jstree').length > 0 && $.jstree.reference('#jstree')) {
            refreshJSTreeBase();
        }
    }

    function createNodeCopyPaste(parentID, parentType, index, name, type, originalNodeId) {
        let node_config = { ...defaultMenuEntities[`ur_${type}`] };
        node_config._def = RED.nodes.getType(node_config.type);
        node_config.id = RED.nodes.id();
        node_config.order = index;
        node_config.name = name;
        if (parentID === 'root' && parentType === 'folder') {
            delete node_config.folder;
        } else {
            node_config[parentType] = parentID;
        }

        // Copy properties from original node if available
        if (originalNodeId) {
            const originalNode = RED.nodes.node(originalNodeId);
            if (originalNode) {
                // Copy page-specific properties for multi/inherited pages
                if (type === 'page' && originalNode.type === 'ur_page') {
                    // Copy common page properties
                    node_config.disp = originalNode.disp !== false;
                    node_config.width = originalNode.width || 6;
                    node_config.collapse = originalNode.collapse || false;
                    node_config.disabled = originalNode.disabled || false;
                    node_config.hidden = originalNode.hidden || false;
                    node_config.access = originalNode.access || '';
                    node_config.accessBehavior = originalNode.accessBehavior || '';

                    // Copy page type properties
                    node_config.pageType = originalNode.pageType || 'single';
                    node_config.isMulti = originalNode.isMulti || false;
                    node_config.isSingle = originalNode.isSingle !== false;
                    node_config.inheritInst = originalNode.inheritInst || false;
                    node_config.expression = originalNode.expression || '';
                    node_config.instances = originalNode.instances
                        ? JSON.parse(JSON.stringify(originalNode.instances))
                        : [];

                    // For inherited pages, copy refPage reference
                    if (originalNode.pageType === 'inherited') {
                        node_config.refPage = originalNode.refPage || 'none';
                    }
                }
            }
        }

        RED.nodes.add(node_config);
        RED.history.push({
            t: 'add',
            nodes: [node_config.id],
            dirty: RED.nodes.dirty(),
        });
        RED.nodes.dirty(true);
        return node_config.id;
    }

    function createNodeUsingJSTree(parentNode, type, instance) {
        // Use the shared createMenuNode function for consistent numbering
        let node_config = createMenuNode(type, parentNode.id, parentNode.type);

        // Add the new node directly to the tree instead of refreshing
        var newNodeData = {
            id: node_config.id,
            text: node_config.name,
            type: type,
            children: [],
        };
        instance.create_node(parentNode.id, newNodeData, 'last');

        return node_config;
    }

    function onHoverNode(node, treeSelector) {
        treeSelector = treeSelector || '#nodeeditjstree';
        var instance = $.jstree.reference(treeSelector);
        let buttons = [];

        // Clean up orphaned cut nodes if clipboard is cleared externally
        if (!clipboard && cutNodes.size > 0) {
            cutNodes.forEach((nodeId) => {
                // Scope to jstree containers to avoid affecting Node-RED flow editor
                $('#nodeeditjstree, #jstree')
                    .find('#' + nodeId.replace(/\./g, '\\.'))
                    .removeClass('jstree-cut');
            });
            cutNodes.clear();
        }

        const addButtonHTML = (icon) => {
            return `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button" style="position: relative; float: right; z-index: 1000; margin-top: 2px; background: rgba(255,255,255, 1); border-radius: 3px; padding: 2px 4px;"> <i class="fa fa-plus"></i> <i class="fa fa-${icon}"></i> </a>`;
        };
        const actionButtonHTML = (icon) => {
            return `<a href="#" class="jstree-hover-button editor-button editor-button-small nr-db-sb-list-header-button" style="position: relative; float: right; z-index: 1000; margin-top: 2px; background: rgba(255,255,255, 1); border-radius: 3px; padding: 2px 4px;"><i class="fa fa-${icon}"></i> </a>`;
        };
        $('.jstree-hover-button').remove();

        if (!cutNodes.has(node.id)) {
            const addButton = (icon, type) => {
                let btn = $(addButtonHTML(icon));
                btn.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    createNodeUsingJSTree(node, type, instance);
                    applyCutClasses();
                    // Re-render hover buttons after tree modification to fix positioning
                    onHoverNode(node, treeSelector);
                });
                return btn;
            };

            let editButton = $(actionButtonHTML('pencil'));
            editButton.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (node.type === 'root') return; // root is virtual, not editable
                if (treeSelector === '#jstree') {
                    $('.jstree-hover-button').remove();
                }
                let nodeData = RED.nodes.node(node.id);
                if (nodeData) {
                    // Widgets are regular nodes, use standard editor
                    if (node.type === 'widget') {
                        RED.editor.edit(nodeData);
                    } else {
                        // Config nodes (folder, page, group, tab, link) use config editor
                        RED.editor.editConfig('', nodeData.type, nodeData.id);
                    }
                }
            });
            if (node.type !== 'root') {
                buttons.push(editButton);
            }

            // Only restrict to edit button in parent or link picker mode
            var isParentMode =
                treeSelector === '#nodeeditjstree' &&
                nodeEditJSTreeOptions &&
                (nodeEditJSTreeOptions.mode === 'parent' || nodeEditJSTreeOptions.mode === 'tablePage');
            if (!isParentMode && ['folder', 'page', 'group', 'tab', 'link'].includes(node.type)) {
                if (['folder', 'page', 'group', 'link'].includes(node.type)) {
                    let pasteButton = $(actionButtonHTML('paste'));
                    pasteButton.on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        pasteFromClipboard(node, treeSelector);
                    });
                    buttons.push(pasteButton);
                }

                let copyButton = $(actionButtonHTML('copy'));
                copyButton.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (clipboard && cutNodes.has(clipboard.id)) {
                        shakeButtons();
                        return;
                    }
                    clipboard = node;
                });
                buttons.push(copyButton);

                let cutButton = $(actionButtonHTML('cut'));
                cutButton.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    cutNode(node, treeSelector);
                });
                buttons.push(cutButton);

                switch (node.type) {
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
                }
            }
            // For link, widget, and other node types: only edit button is shown (already added above)
        } else {
            if (clipboard && clipboard.id !== node.id) {
                return;
            }
            let undoButton = $(actionButtonHTML('undo'));
            undoButton.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                clearClipboard();
                onHoverNode(node, treeSelector);
            });
            buttons.push(undoButton);
        }

        // Scope the search to within the jstree container to avoid conflicts with flow editor SVG elements
        var $node = $(treeSelector).find('#' + node.id.replace(/\./g, '\\.'));

        if ($node.length === 0) {
            console.error('Could not find jsTree node with ID:', node.id);
            return;
        }

        var $anchor = $node.children('.jstree-wholerow');
        if ($anchor.length === 0) {
            $anchor = $node.children('a.jstree-anchor');
        }
        if ($anchor.length === 0) {
            $anchor = $node.find('.jstree-wholerow').first();
        }
        if ($anchor.length === 0) {
            $anchor = $node.find('a.jstree-anchor').first();
        }

        if ($anchor.length > 0) {
            $anchor.append(buttons);
        } else {
            console.error('Could not find anchor element to append buttons to for node:', node.id);
        }
    }

    function initializeJsTree(selectedId, options) {
        options = options || { mode: 'tab' };
        nodeEditJSTreeOptions = options;
        var isParentMode = options.mode === 'parent';
        var isTablePageMode = options.mode === 'tablePage';
        var parentType = options.parentType;
        var allowRoot = options.allowRoot === true;

        if ($('#nodeeditjstree').length === 0) {
            console.error("Element with ID 'nodeeditjstree' not found in the DOM");
            return;
        }
        const jstreeElement = document.getElementById('nodeeditjstree');
        const editPane = jstreeElement.closest('.red-ui-editor');
        let lastVisibilityState = null;
        const checkVisibility = () => {
            const rect = jstreeElement.getBoundingClientRect();
            const isVisible =
                rect.width > 0 &&
                rect.height > 0 &&
                window.getComputedStyle(jstreeElement).display !== 'none' &&
                window.getComputedStyle(jstreeElement).visibility !== 'hidden';

            if (isVisible !== lastVisibilityState) {
                lastVisibilityState = isVisible;
                if (isVisible && !ignoreVisibilityChange && !isParentMode && !isTablePageMode) {
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
        if (editPane) {
            observer.observe(editPane, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }

        if (isTablePageMode) {
            selectedTablePage = selectedId;
        } else {
            selectedTab = selectedId;
        }
        var excludeNodeId = options.excludeNodeId || null;
        var foldersTreeData;
        if (isParentMode) {
            foldersTreeData = extractTreeForParentSelection(parentType, allowRoot, excludeNodeId);
        } else if (isTablePageMode) {
            foldersTreeData = [
                { id: 'none', text: 'None', type: 'ref-none', icon: 'fa fa-ban', children: [] },
            ].concat(extractTreeForParentPageNested(null));
        } else {
            var rootFolders = extractRootFolders();
            foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder, false));
        }
        var debounce = false;

        if ($.jstree.reference('#nodeeditjstree')) {
            $('#nodeeditjstree').jstree('destroy');
        }

        $('#nodeeditjstree').toggleClass('jstree-parent-picker', isParentMode || isTablePageMode);

        $('#nodeeditjstree').jstree({
            'core': {
                'data': foldersTreeData,
                'dblclick_toggle': false,
                'check_callback': function (operation, node, parent) {
                    if (isParentMode || isTablePageMode) {
                        return false; // no move/create in parent selector or table page picker mode
                    }
                    if (operation === 'move_node' || operation === 'create_node') {
                        switch (parent?.type) {
                            case 'folder':
                                if (node.type === 'folder' || node.type === 'page' || node.type === 'link') {
                                    return true;
                                }
                                return false;
                            case 'page':
                                if (node.type === 'group') {
                                    return true;
                                }
                                return false;
                            case 'group':
                                if (node.type === 'tab') {
                                    return true;
                                }
                                return false;
                            case 'tab':
                            case 'link':
                                return false;
                            default:
                                if (parent && parent.id === '#' && (node.type === 'folder' || node.type === 'link')) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                },
            },
            'multiple': false,
            'plugins': isParentMode || isTablePageMode ? ['types', 'search', 'wholerow'] : ['types', 'search', 'wholerow', 'dnd'],
            'dnd': isParentMode || isTablePageMode ? undefined : {
                'copy': false,
                'large_drop_target': true,
                'large_drag_target': true,
                'is_draggable': function (nodes) {
                    return !$('#nodeeditjstree')
                        .find('#' + nodes[0].id.replace(/\./g, '\\.'))
                        .hasClass('jstree-cut');
                },
                'auto_expand': false,
                'open_timeout': 0,
            },
            'types': {
                'default': {},
                'ref-none': {
                    'icon': 'fa fa-ban',
                },
                'root': {
                    'icon': 'fa fa-home',
                },
                'folder': {
                    'icon': 'fa fa-folder-o',
                },
                'page': {
                    'icon': 'fa fa-file-o',
                },
                'page-multi': {
                    'icon': 'fa fa-copy',
                },
                'page-inherited': {
                    'icon': 'fa fa-paste',
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
                'show_only_matches_children': true,
                'search_callback': function (searchString, node) {
                    return fuzzyMatch(plainTextForJstreeSearch(node), searchString);
                },
            },
        });

        $('#nodeeditjstree').on('refresh.jstree', function () {
            applyCutClasses();
        });

        $('#nodeeditjstree').on('open_node.jstree', function () {
            applyCutClasses();
        });

        $('#nodeeditjstree').on('close_node.jstree', function () {
            applyCutClasses();
        });

        $('#nodeeditjstree').on('create_node.jstree', function () {
            applyCutClasses();
        });

        $('#nodeeditjstree').on('move_node.jstree', function (e, data) {
            const reorderNode = (nodeId) => {
                let node = RED.nodes.node(nodeId);
                node.order = newSiblings.indexOf(nodeId) + 1;
                RED.nodes.dirty(true);
                RED.history.push({
                    t: 'edit',
                    node: node,
                    changed: true,
                    dirty: node.dirty,
                    changes: {
                        order: node.order,
                    },
                });
                RED.view.redraw();
            };

            let newParent = data.instance.get_node(data.parent);
            let newSiblings = newParent.children;
            newSiblings.forEach((nodeId) => {
                reorderNode(nodeId);
            });
            if (data.old_parent !== data.parent) {
                let oldSiblings = data.instance.get_node(data.old_parent).children;
                oldSiblings.forEach((nodeId) => {
                    reorderNode(nodeId);
                });
                let node = RED.nodes.node(data.node.id);
                if (node && newParent.type) {
                    node[newParent.type] = newParent.id;
                }
            }
            if (selectedTab && (typeof selectedTab === 'object' ? selectedTab.id : selectedTab)) {
                $('#selectedTabDisplay').html(generatePathBadges(typeof selectedTab === 'object' ? selectedTab.id : selectedTab));
            }
            applyCutClasses();
        });

        $('#nodeeditjstree').on('select_node.jstree', function (e, data) {
            var instance = $.jstree.reference('#nodeeditjstree');
            var isParentMode = nodeEditJSTreeOptions && nodeEditJSTreeOptions.mode === 'parent';
            var parentType = nodeEditJSTreeOptions && nodeEditJSTreeOptions.parentType;

            if (isParentMode) {
                // Selectable types: folder/link parent = root or folder; page parent = folder; group parent = page; tab parent = group
                var selectableTypes = { folder: ['root', 'folder'], page: ['folder'], group: ['page'], tab: ['group'] };
                var allowed = selectableTypes[parentType] || [parentType];
                var canSelect = allowed.indexOf(data.node.type) !== -1;
                if (canSelect && parentType === 'tab' && nodeEditJSTreeOptions.excludeNodeId && data.node.id === nodeEditJSTreeOptions.excludeNodeId) {
                    canSelect = false;
                }
                if (canSelect) {
                    selectedTab = data.node;
                    $('#selectedTabDisplay').html(generatePathBadges(selectedTab.id));
                    $('#nodeeditjstree').removeClass('input-error');
                } else {
                    if (instance.is_open(data.node)) {
                        instance.close_node(data.node);
                    } else {
                        instance.open_node(data.node);
                    }
                    instance.deselect_node(data.node);
                    if (selectedTab && selectedTab.id) {
                        instance.select_node(selectedTab.id);
                    }
                    setTimeout(function () {
                        instance.deselect_node(data.node);
                        if (selectedTab && selectedTab.id) {
                            instance.select_node(selectedTab.id);
                        }
                    }, 220);
                }
                return;
            }

            var isTablePageModeSel = nodeEditJSTreeOptions && nodeEditJSTreeOptions.mode === 'tablePage';
            if (isTablePageModeSel) {
                if (data.node.type === 'page' || data.node.id === 'none' || data.node.type === 'ref-none') {
                    selectedTablePage = data.node;
                    var tid = data.node.id === 'none' || data.node.type === 'ref-none' ? 'none' : data.node.id;
                    $('#selectedTabDisplay').html(generatePathBadges(tid));
                    $('#nodeeditjstree').removeClass('input-error');
                } else {
                    if (instance.is_open(data.node)) {
                        instance.close_node(data.node);
                    } else {
                        instance.open_node(data.node);
                    }
                    instance.deselect_node(data.node);
                    if (selectedTablePage && selectedTablePage.id) {
                        instance.select_node(selectedTablePage.id);
                    }
                    setTimeout(function () {
                        instance.deselect_node(data.node);
                        if (selectedTablePage && selectedTablePage.id) {
                            instance.select_node(selectedTablePage.id);
                        }
                    }, 220);
                }
                return;
            }

            if (data.node.type === 'tab' && !cutNodes.has(data.node.id)) {
                selectedTab = data.node;
                $('#selectedTabDisplay').html(generatePathBadges(selectedTab.id));
                $('#nodeeditjstree').removeClass('input-error');
            } else {
                if (instance.is_open(data.node)) {
                    instance.close_node(data.node);
                } else {
                    instance.open_node(data.node);
                }

                instance.deselect_node(data.node);
                if (
                    selectedTab &&
                    Object.keys($('#' + selectedTab.id)).length !== 0 &&
                    !data.node.children_d.includes(selectedTab.id)
                ) {
                    instance.select_node(selectedTab.id);
                }
                setTimeout(() => {
                    instance.deselect_node(data.node);
                    if (selectedTab && Object.keys($('#' + selectedTab.id)).length !== 0) {
                        instance.select_node(selectedTab.id);
                    }
                }, 220);
            }
        });

        $('#treeSearch').keyup(function () {
            if (debounce) {
                clearTimeout(debounce);
            }
            debounce = setTimeout(function () {
                var v = $('#treeSearch').val();
                var instance = $.jstree.reference('#nodeeditjstree');
                if (instance) {
                    instance.search(v);
                }
                applyCutClasses();
            }, 250);
        });

        $('#nodeeditjstree').on('hover_node.jstree', function (e, data) {
            onHoverNode(data.node, '#nodeeditjstree');
        });

        $('#nodeeditjstree').on('dehover_node.jstree', function (e, data) {
            if (!$('.jstree-hover-button:hover').length) {
                $('.jstree-hover-button').remove();
            }
        });

        $('#nodeeditjstree').on(
            'ready.jstree',
            function () {
                var instance = $.jstree.reference('#nodeeditjstree');
                if (!instance) {
                    console.error('jsTree instance not available');
                    return;
                }

                if (selectedId) {
                    var node = instance.get_node(selectedId);
                    if (node) {
                        instance.select_node(selectedId);
                        if (isTablePageMode) {
                            selectedTablePage = node;
                        } else {
                            selectedTab = node;
                        }
                        var displayId = isTablePageMode && node && node.id === 'none' ? 'none' : node.id;
                        $('#selectedTabDisplay').html(generatePathBadges(displayId));
                        setTimeout(function () {
                            scrollToNode(selectedId);
                        }, 200);
                    } else {
                        $('#selectedTabDisplay').html(generatePathBadges(null));
                        if (!isParentMode) {
                            $('#nodeeditjstree').addClass('input-error');
                        }
                    }
                } else if (isParentMode && allowRoot) {
                    selectedTab = instance.get_node('root');
                    if (selectedTab) {
                        instance.select_node('root');
                        $('#selectedTabDisplay').html(generatePathBadges('root'));
                    } else {
                        $('#selectedTabDisplay').html(generatePathBadges(null));
                    }
                } else {
                    $('#selectedTabDisplay').html(generatePathBadges(null));
                    if (!isParentMode && !isTablePageMode) {
                        $('#nodeeditjstree').addClass('input-error');
                    }
                }
            }.bind(this)
        );

        if (selectedId) {
            var instance = $.jstree.reference('#nodeeditjstree');
            if (instance) {
                var storedNode = instance.get_node(selectedId);
                if (storedNode) {
                    if (isTablePageMode) {
                        selectedTablePage = storedNode;
                    } else {
                        selectedTab = storedNode;
                    }
                    var showId = isTablePageMode && storedNode.id === 'none' ? 'none' : storedNode.id;
                    $('#selectedTabDisplay').html(generatePathBadges(showId));
                } else {
                    $('#selectedTabDisplay').html(generatePathBadges(null));
                    if (!isParentMode) {
                        $('#nodeeditjstree').addClass('input-error');
                    }
                }
            }
        } else if (isParentMode && allowRoot) {
            var instance = $.jstree.reference('#nodeeditjstree');
            if (instance) {
                var rootNode = instance.get_node('root');
                if (rootNode) {
                    selectedTab = rootNode;
                    $('#selectedTabDisplay').html(generatePathBadges('root'));
                }
            }
        } else {
            $('#selectedTabDisplay').html(generatePathBadges(null));
            if (!isTablePageMode && (!isParentMode || (isParentMode && !selectedTab))) {
                $('#nodeeditjstree').addClass('input-error');
            }
        }
    }

    function initializeJsTreeBase() {
        if ($('#jstree').length === 0) {
            console.error("Element with ID 'jstree' not found in the DOM");
            return;
        }

        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder, true));
        var debounce = false;

        if ($.jstree.reference('#jstree')) {
            $('#jstree').jstree('destroy');
        }

        $('#jstree').jstree({
            'core': {
                'data': foldersTreeData,
                'dblclick_toggle': false,
                'check_callback': function (operation, node, parent) {
                    if (operation === 'move_node' || operation === 'create_node') {
                        switch (parent?.type) {
                            case 'folder':
                                if (node.type === 'folder' || node.type === 'page' || node.type === 'link') {
                                    return true;
                                }
                                return false;
                            case 'page':
                                if (node.type === 'group') {
                                    return true;
                                }
                                return false;
                            case 'group':
                                if (node.type === 'tab') {
                                    return true;
                                }
                                return false;
                            case 'tab':
                                // Allow tabs to have children (widgets and other nodes)
                                if (node.type === 'widget') {
                                    return true;
                                }
                                return false;
                            case 'link':
                                return false;
                            default:
                                if (parent && parent.id === '#' && (node.type === 'folder' || node.type === 'link')) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                },
            },
            'multiple': false,
            'plugins': ['types', 'search', 'wholerow', 'dnd'],
            'dnd': {
                'copy': false,
                'large_drop_target': true,
                'large_drag_target': true,
                'is_draggable': function (nodes) {
                    return !$('#jstree')
                        .find('#' + nodes[0].id.replace(/\./g, '\\.'))
                        .hasClass('jstree-cut');
                },
                'auto_expand': false,
                'open_timeout': 0,
            },
            'types': {
                'default': {},
                'folder': {
                    'icon': 'fa fa-folder-o',
                },
                'page': {
                    'icon': 'fa fa-file-o',
                },
                'page-multi': {
                    'icon': 'fa fa-copy',
                },
                'page-inherited': {
                    'icon': 'fa fa-paste',
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
                'widget': {
                    'icon': 'fa fa-picture-o',
                },
            },
            'search': {
                'show_only_matches': true,
                'show_only_matches_children': true,
                'search_callback': function (searchString, node) {
                    return fuzzyMatch(plainTextForJstreeSearch(node), searchString);
                },
            },
        });

        $('#jstree').on('refresh.jstree', function () {
            applyCutClasses();
        });

        $('#jstree').on('open_node.jstree', function () {
            applyCutClasses();
        });

        $('#jstree').on('close_node.jstree', function () {
            applyCutClasses();
        });

        $('#jstree').on('create_node.jstree', function () {
            applyCutClasses();
        });

        $('#jstree').on('move_node.jstree', function (e, data) {
            const reorderNode = (nodeId) => {
                let node = RED.nodes.node(nodeId);
                if (node) {
                    node.order = newSiblings.indexOf(nodeId) + 1;
                    RED.nodes.dirty(true);
                    RED.history.push({
                        t: 'edit',
                        node: node,
                        changed: true,
                        dirty: node.dirty,
                        changes: {
                            order: node.order,
                        },
                    });
                    RED.view.redraw();
                }
            };

            let newParent = data.instance.get_node(data.parent);
            let newSiblings = newParent.children;
            newSiblings.forEach((nodeId) => {
                reorderNode(nodeId);
            });
            if (data.old_parent !== data.parent) {
                let oldSiblings = data.instance.get_node(data.old_parent).children;
                oldSiblings.forEach((nodeId) => {
                    reorderNode(nodeId);
                });
                let node = RED.nodes.node(data.node.id);
                if (node && newParent.type) {
                    node[newParent.type] = newParent.id;
                }
            }
            applyCutClasses();
        });

        $('#jstree').on('select_node.jstree', function (e, data) {
            var instance = $.jstree.reference('#jstree');
            if (instance.is_open(data.node)) {
                instance.close_node(data.node);
            } else {
                instance.open_node(data.node);
            }
            instance.deselect_node(data.node);
        });

        $('#baseTreeSearch').keyup(function () {
            if (debounce) {
                clearTimeout(debounce);
            }
            debounce = setTimeout(function () {
                var v = $('#baseTreeSearch').val();
                var instance = $.jstree.reference('#jstree');
                if (instance) {
                    instance.search(v);
                }
                applyCutClasses();
            }, 250);
        });

        $('#jstree').on('hover_node.jstree', function (e, data) {
            onHoverNode(data.node, '#jstree');
        });

        $('#jstree').on('dehover_node.jstree', function (e, data) {
            if (!$('.jstree-hover-button:hover').length) {
                $('.jstree-hover-button').remove();
            }
        });

        $('#jstree').on('ready.jstree', function () {
            applyCutClasses();
        });
    }

    function refreshJSTreeBase() {
        if (typeof $.jstree === 'undefined' || !$.jstree) {
            console.warn('jsTree library not loaded, skipping refresh');
            return;
        }

        var $jstree = $('#jstree');
        if ($jstree.length === 0) {
            console.warn('jsTree element not found in DOM');
            return;
        }

        var instance = $.jstree.reference($jstree);
        if (!instance) {
            // No existing tree, initialize fresh
            initializeJsTreeBase();
            return;
        }

        // Get fresh data
        var rootFolders = extractRootFolders();
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder, true));

        // Update the data source and refresh in-place (preserves open state)
        instance.settings.core.data = foldersTreeData;
        instance.refresh(true); // true = skip loading indicator
    }

    function destroyRefPageJsTree() {
        if (typeof $ === 'undefined' || !$.jstree) {
            return;
        }
        $(REF_PAGE_TREE).off('select_node.jstree');
        $(REF_PAGE_TREE).off('ready.jstree');
        if ($.jstree.reference(REF_PAGE_TREE)) {
            $(REF_PAGE_TREE).jstree('destroy');
        }
        $(REF_PAGE_SEARCH).off('.refpagejstree');
        $(REF_PAGE_TREE).off('.refpagejstree');
        selectedRefPage = null;
        refPageTreeOptions = null;
    }

    /**
     * Referenced page picker for ur_page inherited mode (separate from folder parent tree).
     * @param {string} selectedId - 'none' or page config id
     * @param {string} selfPageId - current page id to exclude
     * @param {function(string): void} [onSelectionChange] - 'none' or page id
     * @param {string} [displayLabel] - header label for selection display
     */
    function initializeRefPageJsTree(selectedId, selfPageId, onSelectionChange, displayLabel) {
        destroyRefPageJsTree();
        if ($(REF_PAGE_TREE).length === 0) {
            console.error("Referenced page tree element 'refPageJstree' not found in the DOM");
            return;
        }
        refPageTreeOptions = {
            onChange: typeof onSelectionChange === 'function' ? onSelectionChange : null,
            displayLabel: displayLabel || 'Referenced Page',
            selfPageId: selfPageId,
        };

        var treeData = extractTreeForRefPage(selfPageId);
        var debounce = false;

        $(REF_PAGE_TREE).jstree({
            core: {
                data: treeData,
                dblclick_toggle: false,
                check_callback: function () {
                    return false;
                },
            },
            multiple: false,
            plugins: ['types', 'search', 'wholerow'],
            types: {
                'default': {},
                'ref-none': {
                    icon: 'fa fa-ban',
                },
                'root': {
                    icon: 'fa fa-home',
                },
                'folder': {
                    icon: 'fa fa-folder-o',
                },
                'page': {
                    icon: 'fa fa-file-o',
                },
                'page-multi': {
                    icon: 'fa fa-copy',
                },
                'page-inherited': {
                    icon: 'fa fa-paste',
                },
                'group': {
                    icon: 'fa fa-window-maximize',
                },
                'tab': {
                    icon: 'fa fa-columns',
                },
                'link': {
                    icon: 'fa fa-link',
                },
            },
            search: {
                show_only_matches: true,
                show_only_matches_children: true,
                search_callback: function (searchString, node) {
                    return fuzzyMatch(plainTextForJstreeSearch(node), searchString);
                },
            },
        });

        $(REF_PAGE_TREE).on('select_node.jstree', function (e, data) {
            var instance = $.jstree.reference(REF_PAGE_TREE);
            var isSelectable = data.node.type === 'page' || data.node.type === 'ref-none';
            if (isSelectable) {
                selectedRefPage = data.node;
                $(REF_PAGE_DISPLAY).html(generateRefPagePathBadges(data.node.id));
                $(REF_PAGE_TREE).removeClass('input-error');
                if (refPageTreeOptions && refPageTreeOptions.onChange) {
                    refPageTreeOptions.onChange(getSelectedRefPage());
                }
            } else {
                if (instance.is_open(data.node)) {
                    instance.close_node(data.node);
                } else {
                    instance.open_node(data.node);
                }
                instance.deselect_node(data.node);
                if (selectedRefPage && selectedRefPage.id) {
                    instance.select_node(selectedRefPage.id);
                }
                setTimeout(function () {
                    instance.deselect_node(data.node);
                    if (selectedRefPage && selectedRefPage.id) {
                        instance.select_node(selectedRefPage.id);
                    }
                }, 220);
            }
        });

        $(REF_PAGE_SEARCH).on('keyup.refpagejstree', function () {
            if (debounce) {
                clearTimeout(debounce);
            }
            debounce = setTimeout(function () {
                var v = $(REF_PAGE_SEARCH).val();
                var inst = $.jstree.reference(REF_PAGE_TREE);
                if (inst) {
                    inst.search(v);
                }
            }, 250);
        });

        $(REF_PAGE_TREE).on('ready.jstree', function () {
            var inst = $.jstree.reference(REF_PAGE_TREE);
            if (!inst) {
                return;
            }
            var toSelect = 'none';
            if (selectedId && inst.get_node(selectedId)) {
                toSelect = selectedId;
            } else if (selectedId && selectedId !== 'none') {
                toSelect = 'none';
            }
            inst.select_node(toSelect);
            var node = inst.get_node(toSelect);
            if (node) {
                selectedRefPage = node;
                $(REF_PAGE_DISPLAY).html(generateRefPagePathBadges(toSelect));
            } else {
                $(REF_PAGE_DISPLAY).html(generateRefPagePathBadges('none'));
            }
            setTimeout(function () {
                scrollToNode(toSelect, REF_PAGE_TREE);
            }, 200);
            if (refPageTreeOptions && refPageTreeOptions.onChange) {
                refPageTreeOptions.onChange(getSelectedRefPage());
            }
        });
    }

    function getSelectedRefPage() {
        if (!selectedRefPage) {
            return 'none';
        }
        var id = typeof selectedRefPage === 'object' ? selectedRefPage.id : selectedRefPage;
        return id || 'none';
    }

    function getSelectedTab() {
        return selectedTab ? (typeof selectedTab === 'object' ? selectedTab.id : selectedTab) : null;
    }

    /**
     * Selected ur_page id in table "link" column picker (mode: 'tablePage'). Unrelated to getSelectedTab.
     * Returns null when "None" is selected or the dialog has no page.
     */
    function getSelectedTablePage() {
        if (!nodeEditJSTreeOptions || nodeEditJSTreeOptions.mode !== 'tablePage') {
            return null;
        }
        if (selectedTablePage == null) {
            return null;
        }
        var id = typeof selectedTablePage === 'object' ? selectedTablePage.id : selectedTablePage;
        if (id === 'none') {
            return null;
        }
        return id;
    }

    /**
     * Returns the currently selected parent id in parent-selector mode.
     * Returns 'root' when ROOT is selected, or the folder/page/group id.
     * Returns null when not in parent mode or nothing selected.
     */
    function getSelectedParent() {
        if (!nodeEditJSTreeOptions || nodeEditJSTreeOptions.mode !== 'parent') {
            return null;
        }
        if (!selectedTab) return null;
        var id = typeof selectedTab === 'object' ? selectedTab.id : selectedTab;
        return id || null;
    }

    /**
     * Creates a parent-picker dialog backed by jstree and returns an open() function.
     *
     * @param {Object} opts
     *   opts.title         {string}  Dialog title
     *   opts.selectedId    {string}  Node ID to pre-select ('root' or a node id)
     *   opts.jstreeOptions {Object}  Passed directly to initializeJsTree
     *   opts.summaryEl     {jQuery}  Form element that receives the selected-path badge HTML
     *   opts.onDone        {function(id)} Optional; called on Done with selected id (or getSelectedParent in parent mode)
     * @returns {Function} Call to open the dialog
     */
    function createParentPickerDialog(opts) {
        var title = opts.title || 'Select Parent';
        var jstreeOptions = opts.jstreeOptions || { mode: 'parent' };
        var $summaryEl = opts.summaryEl;
        var selectedId =
            opts.selectedId == null || opts.selectedId === ''
                ? jstreeOptions.mode === 'tablePage'
                    ? null
                    : 'root'
                : opts.selectedId;

        var $existing = $('#ur-parent-picker-dialog');
        if ($existing.length) {
            try { $existing.dialog('destroy'); } catch (e) {}
            $existing.remove();
        }

        var $dlg = $('<div id="ur-parent-picker-dialog" class="red-ui-editor-dialog" style="padding:10px 12px;">')
            .append('<div id="selectedTabDisplay" style="margin-bottom:8px;min-height:22px;"></div>')
            .append('<input type="text" id="treeSearch" placeholder="Search..." style="width:100%;margin-bottom:6px;">')
            .append('<div id="nodeeditjstree" style="height:280px;overflow-y:auto;border:1px solid #ccc;padding:5px;border-radius:4px;"></div>');
        $dlg.appendTo('body');

        var $dialogPath = $('#selectedTabDisplay');

        function syncSummaryBadges() {
            if (!$summaryEl) return;
            var parts = [];
            var started = false;
            $dialogPath.contents().each(function () {
                if (!started) {
                    if (this.nodeType === 1 && $(this).hasClass('badge')) {
                        started = true;
                        parts.push(this.outerHTML);
                    }
                } else {
                    parts.push(this.nodeType === 3 ? this.textContent : this.outerHTML);
                }
            });
            $summaryEl.html(parts.join(''));
        }

        initializeJsTree(selectedId, jstreeOptions);
        $('#nodeeditjstree').one('ready.jstree', syncSummaryBadges);

        var _originalSummaryHtml = '';
        var _originalSelectedId = selectedId;
        var _confirmed = false;

        $dlg.dialog({
            modal: true,
            title: title,
            autoOpen: false,
            width: 420,
            resizable: false,
            open: function () {
                _confirmed = false;
                _originalSummaryHtml = $summaryEl ? $summaryEl.html() : '';
                var current;
                if (jstreeOptions.mode === 'parent') {
                    current = getSelectedParent();
                } else if (jstreeOptions.mode === 'tablePage') {
                    current = getSelectedTablePage();
                } else {
                    current = getSelectedTab();
                }
                _originalSelectedId = current != null && current !== '' ? current : selectedId;
            },
            beforeClose: function () {
                if (!_confirmed) {
                    if ($summaryEl) $summaryEl.html(_originalSummaryHtml);
                    initializeJsTree(_originalSelectedId, jstreeOptions);
                }
                _confirmed = false;
            },
            create: function () {
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
                var btn = $(this).closest('.ui-dialog').find('.ui-dialog-buttonset button').last();
                btn.addClass('ur-jstree-done-btn');
                btn.css({
                    background: 'var(--red-ui-workspace-button-background-primary)',
                    borderColor: 'var(--red-ui-workspace-button-background-primary)'
                });
                btn[0].style.setProperty('color', '#fff', 'important');
            },
            buttons: [
                {
                    text: 'Cancel',
                    click: function () { $(this).dialog('close'); }
                },
                {
                    text: 'Done',
                    click: function () {
                        _confirmed = true;
                        syncSummaryBadges();
                        if (typeof opts.onDone === 'function') {
                            var id;
                            if (jstreeOptions.mode === 'parent') {
                                id = getSelectedParent();
                            } else if (jstreeOptions.mode === 'tablePage') {
                                id = getSelectedTablePage();
                            } else {
                                id = getSelectedTab();
                            }
                            opts.onDone(id);
                        }
                        $(this).dialog('close');
                    }
                }
            ]
        });

        return function () { $dlg.dialog('open'); };
    }

    /**
     * Creates a ref-page picker dialog backed by the ref-page jstree and returns { open, destroy }.
     *
     * @param {Object} opts
     *   opts.title              {string}   jQuery UI dialog titlebar text
     *   opts.selectedId         {string}   'none' or page id to pre-select
     *   opts.selfPageId         {string}   Current page id to exclude from the tree
     *   opts.displayLabel       {string}   Badge prefix shown in the dialog path display
     *   opts.summaryEl          {jQuery}   Form element that receives the selected-path badge HTML
     *   opts.onSelectionChange  {Function} Called with the selected page id on every tree selection
     * @returns {{ open: Function, destroy: Function }}
     */
    function createRefPagePickerDialog(opts) {
        var $existing = $('#ur-refpage-picker-dialog');
        if ($existing.length) {
            try { $existing.dialog('destroy'); } catch (e) {}
            $existing.remove();
            destroyRefPageJsTree();
        }

        var $dlg = $('<div id="ur-refpage-picker-dialog" class="red-ui-editor-dialog" style="padding:10px 12px;">')
            .append('<div id="refPageSelectedDisplay" style="margin-bottom:8px;min-height:22px;"></div>')
            .append('<input type="text" id="refPageTreeSearch" placeholder="Search..." style="width:100%;margin-bottom:6px;">')
            .append('<div id="refPageJstree" style="height:280px;overflow-y:auto;border:1px solid #ccc;padding:5px;border-radius:4px;"></div>');
        $dlg.appendTo('body');

        var $displayEl = $('#refPageSelectedDisplay');

        function syncSummaryBadges() {
            if (!opts.summaryEl) return;
            var parts = [];
            var started = false;
            $displayEl.contents().each(function () {
                if (!started) {
                    if (this.nodeType === 1 && $(this).hasClass('badge')) {
                        started = true;
                        parts.push(this.outerHTML);
                    }
                } else {
                    parts.push(this.nodeType === 3 ? this.textContent : this.outerHTML);
                }
            });
            opts.summaryEl.html(parts.join(''));
        }

        function initWithSync(refId) {
            initializeRefPageJsTree(
                refId,
                opts.selfPageId,
                opts.onSelectionChange || null,
                opts.displayLabel || 'Referenced Page'
            );
            $(REF_PAGE_TREE).one('ready.jstree', syncSummaryBadges);
        }

        initWithSync(opts.selectedId || 'none');

        var _originalSummaryHtml = '';
        var _originalRefId = opts.selectedId || 'none';
        var _confirmed = false;

        $dlg.dialog({
            modal: true,
            title: opts.title || opts.displayLabel || 'Select Referenced Page',
            autoOpen: false,
            width: 420,
            resizable: false,
            open: function () {
                _confirmed = false;
                _originalSummaryHtml = opts.summaryEl ? opts.summaryEl.html() : '';
                _originalRefId = getSelectedRefPage() || opts.selectedId || 'none';
            },
            beforeClose: function () {
                if (!_confirmed) {
                    if (opts.summaryEl) opts.summaryEl.html(_originalSummaryHtml);
                    initWithSync(_originalRefId);
                }
                _confirmed = false;
            },
            create: function () {
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
                var btn = $(this).closest('.ui-dialog').find('.ui-dialog-buttonset button').last();
                btn.addClass('ur-jstree-done-btn');
                btn.css({
                    background: 'var(--red-ui-workspace-button-background-primary)',
                    borderColor: 'var(--red-ui-workspace-button-background-primary)'
                });
                btn[0].style.setProperty('color', '#fff', 'important');
            },
            buttons: [
                {
                    text: 'Cancel',
                    click: function () { $(this).dialog('close'); }
                },
                {
                    text: 'Done',
                    click: function () {
                        _confirmed = true;
                        syncSummaryBadges();
                        $(this).dialog('close');
                    }
                }
            ]
        });

        function destroy() {
            if ($dlg.data('ui-dialog')) {
                try { $dlg.dialog('destroy'); } catch (e) {}
            }
            $dlg.remove();
            destroyRefPageJsTree();
        }

        return {
            open: function () { $dlg.dialog('open'); },
            destroy: destroy
        };
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
    window.initializeJsTreeBase = initializeJsTreeBase;
    window.refreshJSTree = refreshJSTree;
    window.refreshJSTreeBase = refreshJSTreeBase;
    window.getSelectedTab = getSelectedTab;
    window.getSelectedTablePage = getSelectedTablePage;
    window.getSelectedParent = getSelectedParent;
    window.clearClipboard = clearClipboard;
    window.initializeRefPageJsTree = initializeRefPageJsTree;
    window.destroyRefPageJsTree = destroyRefPageJsTree;
    window.getSelectedRefPage = getSelectedRefPage;
    window.createParentPickerDialog = createParentPickerDialog;
    window.createRefPagePickerDialog = createRefPagePickerDialog;
    window.getNavConfigPathText = getNavConfigPathText;
    window.getFormSummaryPathHtmlForTablePageId = getFormSummaryPathHtmlForTablePageId;
})();
