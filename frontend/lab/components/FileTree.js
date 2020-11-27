import { html } from '../deps/Preact.js';
import Text from '../ui/Text.js';
import Icon from '../ui/Icon.js';

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function FileTree({ tree, selected, expanded, onSelect, onExpand, ...props }) {
    function onEntryClick() {
        onSelect(tree);
        if(tree.type === 'directory') {
            onExpand(tree, !isExpanded());
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
    const treeChildren = tree.type === 'directory' ? tree.children.map(child => {
        return html`
            <${FileTree} tree=${child} selected=${selected} expanded=${expanded} onSelect=${onSelect} onExpand=${onExpand}/>
        `;
    }) : [];
    return html`
        <div class="file-tree-container">
            <${Text}
                className="${selected === tree.id ? 'file-tree-entry-selected ' : ''}file-tree-entry"
                onclick=${onEntryClick}
                draggable="true"
            >
                ${fileIcon}
                ${tree.type === 'directory' && html`<${Icon} name="${isExpanded() ? 'caret-down' : 'caret-right'}"/>`}
                <span class="ml-1">${tree.name}</span>
            </${Text}>
            <div class="file-tree-children" style="display: ${isExpanded() ? 'block' : 'none'}">
                ${treeChildren}
            </div>
        </div>
    `;
}

export function transformFileTree(data) {
    data.id = makeid(8);
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
    for(let child of tree.children) {
        if(child.type === 'directory') {
            const dirPath = currentPath + child.name + '/';
            paths[child.id] = dirPath;
            getTreePaths(child, dirPath, paths);
        }
        else {
            paths[child.id] = currentPath + child.name;
        }
    }
    return paths;
}

export default FileTree;