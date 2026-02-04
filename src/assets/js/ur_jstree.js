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
    
    RED.nodes.eachConfig(function(node) {
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

    function extractFolderChildren(folderNode, includeWidgets) {
        const folder = {
            text: folderNode.name,
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
                text: page.name,
                id: page.id,
                type: 'page',
                icon: pageIcon,
                children: [],
            };
            extractNodesFromConfig('ur_group', 'page', page).forEach((group) => {
                const groupNode = {
                    text: group.name,
                    id: group.id,
                    type: 'group',
                    children: extractNodesFromConfig('ur_tab', 'group', group).map((tab) => {
                        const tabNode = {
                            text: tab.name,
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
                                        type: 'widget',
                                    });
                                }
                            });
                        }
                        
                        return tabNode;
                    }),
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
            if (node.type === 'ur_link' && !node.folder) {
                rootLinksArray.push(node);
            }
        });

        return [...rootFoldersArray, ...rootLinksArray].sort((a, b) => a.order - b.order);
    }

    function scrollToNode(nodeId) {
        let treeInstance = $.jstree.reference('#nodeeditjstree');
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
        let treeInstance = $.jstree.reference('#nodeeditjstree');
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
            const badgeText = currentNode.text.length > 25 ? currentNode.text.slice(0, 25) + '...' : currentNode.text;
            let badge = `<span class="badge badge-${nodeType === 'tab' ? 'selected' : 'standard'}"><i class="${
                currentNode.icon
            }"></i> ${badgeText}</span>`;
            pathArray.unshift(badge);
            currentNode = treeInstance.get_node(currentNode.parent);
        }

        return `<i class="fa fa-columns"></i> Selected Tab: ${pathArray.join(
            ' <i class="fa fa-chevron-right" style="font-size: 0.7em"></i> '
        )}`;
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
                $('#nodeeditjstree, #jstree').find('#' + nodeId).removeClass('jstree-cut');
            });
            cutNodes.clear();
            return;
        }

        cutNodes.forEach((nodeId) => {
            // Scope to jstree containers to avoid affecting Node-RED flow editor
            $('#nodeeditjstree, #jstree').find('#' + nodeId).addClass('jstree-cut');
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
                $('#nodeeditjstree, #jstree').find('#' + currentNode.id).removeClass('jstree-cut');
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
            $('#nodeeditjstree, #jstree').find('#' + currentNode.id).addClass('jstree-cut');
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
                $('#nodeeditjstree, #jstree').find('#' + currentNode.id).removeClass('jstree-cut');
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
                currentNode.id  // Pass original node ID to copy properties from
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
                // Clear old parent reference if different from new parent type
                if (oldParentType !== newParentType) {
                    delete redNode[oldParentType];
                }
            }
            redNode[newParentType] = newParentId;
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
        console.log('node_config.id', node_config.id);
        node_config.order = index;
        node_config.name = name;
        node_config[parentType] = parentID;
        
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
                    node_config.instances = originalNode.instances ? JSON.parse(JSON.stringify(originalNode.instances)) : [];
                    
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
            children: []
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
                $('#nodeeditjstree, #jstree').find('#' + nodeId).removeClass('jstree-cut');
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
            buttons.push(editButton);

            // Only show copy/cut/paste/add buttons for organizational nodes (folder, page, group, tab)
            if (['folder', 'page', 'group', 'tab'].includes(node.type)) {
                if (['folder', 'page', 'group'].includes(node.type)) {
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
        var $node = $(treeSelector).find('#' + node.id);
        
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

    function initializeJsTree(tabId) {
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
        var foldersTreeData = rootFolders.map((folder) => extractFolderChildren(folder, false));
        var debounce = false;

        if ($.jstree.reference('#nodeeditjstree')) {
            $('#nodeeditjstree').jstree('destroy');
        }

        $('#nodeeditjstree').jstree({
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
                    return !$('#nodeeditjstree').find('#' + nodes[0].id).hasClass('jstree-cut');
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
            },
            'search': {
                'show_only_matches': true,
                'search_callback': function (searchString, node) {
                    return fuzzyMatch(node.text, searchString);
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
                node[newParent.type] = newParent.id;
            }
            $('#selectedTabDisplay').html(generatePathBadges(selectedTab.id));
            applyCutClasses();
        });

        $('#nodeeditjstree').on('select_node.jstree', function (e, data) {
            if (data.node.type === 'tab' && !cutNodes.has(data.node.id)) {
                selectedTab = data.node;
                $('#selectedTabDisplay').html(generatePathBadges(selectedTab.id));
                $('#nodeeditjstree').removeClass('input-error');
            } else {
                var instance = $.jstree.reference('#nodeeditjstree');
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
            var instance = $.jstree.reference('#nodeeditjstree');
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
            $('#nodeeditjstree').addClass('input-error');
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
                    return !$('#jstree').find('#' + nodes[0].id).hasClass('jstree-cut');
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
                'search_callback': function (searchString, node) {
                    return fuzzyMatch(node.text, searchString);
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

    function getSelectedTab() {
        return selectedTab ? selectedTab.id : null;
    }

    // Exposes functions to global scope for use in HTML scripts
    window.initializeJsTree = initializeJsTree;
    window.initializeJsTreeBase = initializeJsTreeBase;
    window.refreshJSTree = refreshJSTree;
    window.refreshJSTreeBase = refreshJSTreeBase;
    window.getSelectedTab = getSelectedTab;
    window.clearClipboard = clearClipboard;
})();
