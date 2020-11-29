import { html, useState, useEffect } from '../deps/Preact.js';
import Text from '../ui/Text.js';
import FileTree, { transformFileTree, getTreePaths } from '../components/FileTree.js';
import { Tabs, TabPanel } from '../ui/Tabs.js';
import IconButton from '../ui/IconButton.js';
import Spinner from '../ui/Spinner.js';
import NewFile from './NewFile.js';
import Toast from '../ui/Toast.js';
import ResizeBar from '../components/ResizeBar.js';
import ContextMenu, { ContextMenuDivider, ContextMenuItem } from '../components/ContextMenu.js';
import FileTreeService from '../services/FileTreeService.js';

function makeid(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i=0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function getOpenUrl(path) {
    return `/open?path=${encodeURIComponent(path.slice(1))}`;
}
function getNameFromPath(path) {
    return path.split('/').reverse()[0];
}

function Editor(props) {
    const [contextMenuData, setContextMenuData] = useState(null);

    const [fileTree, setFileTree] = useState({});
    const [fileSelected, setFileSelected] = useState('');
    const [fileEditing, setFileEditing] = useState('');
    const [treeExpanded, setTreeExpanded] = useState({});

    const [tabIndex, setTabIndex] = useState(0);
    const [openTabs, setOpenTabs] = useState([]);

    const [newNotebookData, setNewNotebookData] = useState(null);
    const [globalErrors, setGlobalErrors] = useState([]);

    const [editorLeftWidth, setEditorLeftWidth] = useState(parseInt(localStorage.getItem('filesWidth') || '300'));

    useEffect(() => {
        function handleContextMenu(e) {
            // Leave context menu handling up to the individual components of the editor
            e.preventDefault();
            return false;
        }
        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
            window.removeEventListener('mouseup', handleMouseUp);
        };
    });

    useEffect(() => {
        handleFileRefresh();
    }, [setFileTree]);

    function pushError(title, message, severity='danger', timeout=10000) {
        const _globalErrors = [ ...globalErrors ];
        _globalErrors.push({ id: makeid(8), title, message, severity, timeout });
        setGlobalErrors(_globalErrors);
    }

    function handleFileRefresh(showLoader=true) {
        if(showLoader) {
            setFileTree({});    
        }
        FileTreeService.getTree()
            .then(data => {
                transformFileTree(data);
                setFileTree(data);
            });
    }
    function handleFileSelected(tree) {
        const treeId = tree.id;
        setFileSelected(treeId);

        if(tree.type === 'file') {
            const paths = getTreePaths(fileTree);
            const path = paths[treeId];
            
            const openTabPaths = openTabs.map(x => x.path);
            if(openTabPaths.includes(path)) {
                setTabIndex(openTabPaths.indexOf(path));
            }
            else {
                const _openTabs = [ ...openTabs ];
                _openTabs.push({
                    type: 'frame',
                    url: getOpenUrl(path),
                    path,
                    name: getNameFromPath(path)
                });
                setOpenTabs(_openTabs);
                setTabIndex(_openTabs.length-1);

                // TODO: Attach this to a socket event from Pluto endpoint
                setTimeout(() => handleFileRefresh(false), 1000);
            }
        }
    }
    function handleFileAdd(treeNode = null) {
        const paths = getTreePaths(fileTree);
        const openTabComponents = openTabs.map(x => x.component);
        const _openTabs = [ ...openTabs ];
        const newFileProps = {
            onCreate: handleFileCreate,
            defaultFileName: treeNode ? paths[treeNode.id] : ''
        };
        if(openTabComponents.includes(NewFile)) {
            const newFileIndex = openTabComponents.indexOf(NewFile);
            setTabIndex(newFileIndex);
            _openTabs[newFileIndex].props = newFileProps;
        }
        else {
            _openTabs.push({
                type: 'component',
                component: NewFile,
                name: "New File",
                props: newFileProps
            });
            setOpenTabs(_openTabs);
            setTabIndex(_openTabs.length-1);
        }
    }
    function handleFileCreate(notebookData) {
        setNewNotebookData(notebookData);
    }
    function handleTreeExpand(tree, expanded) {
        const _treeExpanded = { ...treeExpanded };
        _treeExpanded[tree.id] = expanded;
        setTreeExpanded(_treeExpanded);
    }
    function handleFileMove(moveTreeId, parentTreeId, type) {
        const paths = getTreePaths(fileTree);
        FileTreeService.moveFile(
            FileTreeService.normalizePath(paths[moveTreeId]),
            FileTreeService.normalizePath(paths[parentTreeId]) + FileTreeService.getFileName(paths[moveTreeId])
        ).then(res => {
            handleFileRefresh(false);
        }).catch(err => {
            pushError('File Move Error', err);
            console.log('Move error: ', err);
        });
    }
    function handleTreeRenameStart(tree) {
        setFileEditing(tree.id);
    }
    function handleTreeRenameEnd(tree, newName) {
        const paths = getTreePaths(fileTree);
        const pathSplit = paths[tree.id].split('/');
        const dstPath = tree.type === 'file' ? FileTreeService.getDirPath(paths[tree.id]) + newName : pathSplit.slice(0, pathSplit.length-2).join('/') + '/' + newName + '/';
        FileTreeService.moveFile(paths[tree.id], dstPath)
            .then(res => {
                setFileEditing('');
                handleFileRefresh(false);
            })
            .catch(err => {
                pushError('File Rename Error', err);
                console.log('Rename error: ', err);
            });
    }
    function handleContextMenu(menuData) {
        setContextMenuData(menuData);
    }
    function handleMouseUp(e) {
        if(contextMenuData) {
            setContextMenuData(null);
        }
    }

    function handleTabClick(idx) {
        if(tabIndex !== idx) {
            setTabIndex(idx);
        }
    }
    function handleTabClose(idx) {
        const _openTabs = [ ...openTabs ];
        _openTabs.splice(idx, 1);
        setOpenTabs(_openTabs);
        if(idx <= tabIndex) setTabIndex(tabIndex > 0 ? tabIndex - 1 : 0);
    }
    function handleTabRearrange(tabArrangement) {
        const _openTabs = [ ...openTabs ];
        for(let i=0; i<tabArrangement.length; i++) {
            _openTabs[i] = openTabs[tabArrangement[i]];
        }
        setOpenTabs(_openTabs);
        setTabIndex(tabArrangement.indexOf(tabIndex));
    }
    function handleFrameLoad(idx) {
        
    }

    function onViewResize(mx, my) {
        if(mx > 200) {
            setEditorLeftWidth(mx);
            localStorage.setItem('filesWidth', mx);
        }
    }

    function handleGlobalErrorClose(errorId) {
        return () => setGlobalErrors([ ...globalErrors ].filter(x => x.id !== errorId));
    }

    if(newNotebookData) {
        const newTabIndex = openTabs.map(x => x.component).indexOf(NewFile);
        const _openTabs = [ ...openTabs ];
        _openTabs.splice(newTabIndex, 1, {
            type: 'frame',
            url: getOpenUrl(newNotebookData.path),
            path: newNotebookData.path,
            name: getNameFromPath(newNotebookData.path)
        });
        setOpenTabs(_openTabs);
        handleFileRefresh(false);
        setNewNotebookData(null);
    }

    
    const editorActions = {
        newFile: handleFileAdd,
        openFile: handleFileSelected,
        beginTreeRename: handleTreeRenameStart,
        endTreeRename: handleTreeRenameEnd,
        cancelTreeRename: () => setFileEditing('')
    };

    return html`
        <div class="editor-container">
            <div class="editor-left p-3 pl-4" style="width: ${editorLeftWidth}px">
                <div style="display: flex">
                    <${Text} variant="h4">Files</${Text}>
                    <div style="flex-grow: 1"/>
                    <${IconButton} icon="arrow-clockwise" size=20 onClick=${handleFileRefresh}/>
                    <${IconButton} icon="plus" onClick=${handleFileAdd}/>
                </div>
                ${Object.keys(fileTree).length === 0 ?
                    html`<div style="display: flex; justify-content: center" class="mt-4"><${Spinner}/></div>`
                    :
                    html`
                        <${FileTree}
                            tree=${fileTree}
                            selected=${fileSelected}
                            editing=${fileEditing}
                            expanded=${treeExpanded}
                            onSelect=${handleFileSelected}
                            onExpand=${handleTreeExpand}
                            onMove=${handleFileMove}
                            onContextMenu=${handleContextMenu}
                            editorActions=${editorActions}/>
                    `
                }
            </div>
            <div class="editor-center">
                <${ResizeBar.Vertical} onChange=${onViewResize}/>
            </div>
            <div class="editor-right">
                <${Tabs}
                    tab="${tabIndex}"
                    tabLabels="${openTabs.map(x => x.name)}"
                    onClick=${handleTabClick}
                    onClose=${handleTabClose}
                    onTabRearrange=${handleTabRearrange}/>
                ${openTabs.map((tabData, i) => (
                    html`
                        <${TabPanel} tab=${tabIndex} index=${i} style="flex-grow: 1; position: relative">
                            ${tabData.type === 'frame' && html`<iframe class="pluto-frame" src="${tabData.url}" onload=${handleFrameLoad(i)}></iframe>`}
                            ${tabData.type === 'component' && html`<${tabData.component} ...${tabData.props || {}}/>`}
                        </${TabPanel}>
                    `
                ))}
            </div>

            <div class="editor-global-errors">
                ${globalErrors.map(x => (
                    html`
                        <${Toast} title="${x.title}" timeout="${x.timeout}" severity="${x.severity}" onClose="${handleGlobalErrorClose(x.id)}">
                            ${x.message}
                        </${Toast}>
                    `
                ))}
            </div>

            ${ contextMenuData ?
                html`
                    <${ContextMenu} x=${contextMenuData.position.x} y=${contextMenuData.position.y}>
                        ${contextMenuData.elements.map(el => (
                            Object.keys(el).length > 0 ?
                            html`<${ContextMenuItem} onClick=${() => el.action(...(el.payload || []))}>${el.name}</${ContextMenuItem}>`
                            :
                            html`<${ContextMenuDivider}/>`
                        ))}
                    </${ContextMenu}>
                `
            : ''}
        </div>
    `;
}

export default Editor;