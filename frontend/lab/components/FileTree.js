import { html, useRef, useEffect } from '../deps/Preact.js';
import Text from '../ui/Text.js';
import Icon from '../ui/Icon.js';
import EventUtils from '../utils/EventUtils.js';
import FileTreeService from '../services/FileTreeService.js';
import {  } from '../../imports/Preact.js';

function FileTree({ tree, selected, editing, expanded, onSelect, onExpand, onMove, notRoot, onContextMenu, editorActions, ...props }) {
    const editRef = useRef();

    useEffect(() => {
        if(editRef.current) {
            editRef.current.focus();
            editRef.current.select();
        }
    }, [editRef, editing]);

    function onEntryClick() {
        onSelect(tree);
        if(tree.type === 'directory') {
            onExpand(tree, !isExpanded());
        }
    }

    function handleMouseUp(treeNode) {
        return e => {
            if(EventUtils.rightMousePressed(e)) {
                e.stopPropagation();
                const noop = () => {};
                const elements = [];
                if(treeNode.type === 'file') elements.push({ name: 'Open', action: editorActions.openFile, payload: [ treeNode ] });
                if(treeNode.type === 'directory' || treeNode.type === undefined) {
                    elements.push({ name: 'New File', action: editorActions.newFile, payload: [ treeNode.type === undefined ? tree : treeNode ] });
                    elements.push({ name: 'New Folder', action: noop });
                    treeNode.type && elements.push({});
                }
                if(treeNode.type) {
                    elements.push(...[
                        { name: 'Cut', action: noop },
                        { name: 'Copy', action: noop },
                        { name: 'Paste', action: noop, visible: treeNode.type === 'directory' },
                        { name: 'Copy Path', action: noop }
                    ])
                    if(notRoot) {
                        elements.push({});
                        elements.push(...[
                            { name: 'Rename', action: editorActions.beginTreeRename, payload: [ treeNode ] },
                            { name: 'Delete', action: noop }
                        ]);
                    }
                }
                onContextMenu({
                    position: { x: e.clientX, y: e.clientY },
                    elements
                });
            }
        };
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('treeId', tree.id);
        e.dataTransfer.setData('treeType', tree.type);
    }
    function handleDragOver(e) {
        e.preventDefault();
        if(tree.type === 'directory') {
            e.stopPropagation();
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
        }
    }
    function handleDragLeave(e) {
        if(tree.type === 'directory') {
            e.currentTarget.style.background = '';
        }
    }
    function handleDrop(e) {
        if(tree.type === 'directory') {
            e.stopPropagation();

            const target = e.currentTarget;
            target.style.background = '';
            const moveTreeId = e.dataTransfer.getData('treeId');
            const moveTreeType = e.dataTransfer.getData('treeType');

            if(moveTreeId) {
                // If the user attempts to move a destination inside itself
                if(tree.id.includes(moveTreeId)) {
                    target.style.background = 'rgba(255, 0, 0, 0.08)';
                    setTimeout(() => {
                        target.style.background = '';
                    }, 500);
                }
                else {
                    onMove(moveTreeId, tree.id, moveTreeType);
                }
            }
        }
    }

    function handleDoneEditing() {
        if(editRef.current) {
            editorActions.endTreeRename(tree, editRef.current.value);
        }
    }
    function handleEditKey(e) {
        if(EventUtils.enterPressed(e)) {
            handleDoneEditing();
        }
        if(EventUtils.escapePressed(e)) {
            editorActions.cancelTreeRename();
        }
    }

    function isExpanded(id) {
        id = id || tree.id;
        return expanded[tree.id] === undefined ? true : expanded[tree.id];
    }

    let fileIcon = null;
    if(tree.type === 'file') {
        fileIcon = html`<${Icon} name="${getFileIcon(tree.name)}"/>`;
    }
    let dotIcon = null;
    if(tree.type === 'file' && tree.running) {
        dotIcon = html`<div style="width: 0; height: 0; position: relative"><${Icon} style="position: relative; top: -16px; left: -21.5px;" name="dot" size=32/></div>`;
    }
    const treeChildren = tree.type === 'directory' ? tree.children.map(child => {
        return html`
            <${FileTree} notRoot="true" tree=${child} selected=${selected} editing=${editing} expanded=${expanded} onSelect=${onSelect} onExpand=${onExpand} onMove=${onMove} onContextMenu=${onContextMenu} editorActions=${editorActions} onmouseup=${handleMouseUp(tree)}/>
        `;
    }) : [];

    const thisEditing = editing === tree.id;

    return html`
        <div class="file-tree-container"
            ondragover=${handleDragOver}
            ondragleave=${handleDragLeave}
            ondrop=${handleDrop} 
            onmouseup=${notRoot ? () => {} : handleMouseUp({})}
            ...${props}
        >
            <${Text}
                className="${selected === tree.id ? 'file-tree-entry-selected ' : ''}file-tree-entry"
                onclick=${onEntryClick}
                draggable=${!thisEditing}
                ondragstart=${handleDragStart}
                onmouseup=${handleMouseUp(tree)}
            >
                ${dotIcon}
                ${fileIcon}
                ${tree.type === 'directory' && html`<${Icon} name="${isExpanded() ? 'caret-down' : 'caret-right'}"/>`}
                <span class="file-tree-label-span ml-1">
                    ${thisEditing ?
                        html`<input
                            ref=${editRef}
                            class="file-tree-input"
                            type="text" value="${tree.name}"
                            onclick="${e => e.stopPropagation()}"
                            onkeyup=${handleEditKey}
                            onblur=${handleDoneEditing}/>`
                        :
                        tree.name
                    }
                </span>
            </${Text}>
            <div class="file-tree-children" style="display: ${isExpanded() ? 'block' : 'none'}">
                ${treeChildren}
            </div>
        </div>
    `;
}

export function transformFileTree(data) {
    if(data.type === 'directory') {
        for(let child of data.children) {
            transformFileTree(child);
        }
    }
}
const fileNameMap = {
    jl: 'file-earmark-code',
    js: {
        _: 'file-earmark-code',
        min: 'file-earmark-binary'
    },
    bin: 'file-earmark-binary',
    dat: 'file-earmark-binary',
    txt: 'file-earmark-text',
    png: 'file-earmark-image',
    jpg: 'file-earmark-image',
    jpeg: 'file-earmark-image',
    svg: 'file-earmark-image',
    pdf: 'file-earmark-richtext',
    zip: 'file-earmark-zip'
}
export function getFileIcon(filename) {
    const f = filename.toLowerCase().split('.').reverse();
    const mapped = fileNameMap[f[0]];
    if(mapped) {
        if(typeof mapped === 'string') return mapped;
        else if(typeof mapped === 'object') {
            const subMapped = mapped[f[1]];
            if(typeof subMapped === 'string') return subMapped;
            else return (subMapped && subMapped._) || 'file-earmark';
        }
    }
    else {
        return 'file-earmark';
    }
}
export function getTreePaths(tree, currentPath='/', paths={}) {
    if(currentPath === '/') {
        paths[tree.id] = '';
    }
    for(let child of tree.children) {
        if(child.type === 'directory') {
            const dirPath = currentPath + child.name + '/';
            paths[child.id] = FileTreeService.normalizePath(dirPath);
            getTreePaths(child, dirPath, paths);
        }
        else {
            paths[child.id] = currentPath + child.name;
        }
    }
    return paths;
}

export default FileTree;