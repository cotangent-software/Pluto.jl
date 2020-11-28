import { html, useState, useEffect } from '../deps/Preact.js';
import Container from '../ui/Container.js';
import Grid from '../ui/Grid.js';
import Text from '../ui/Text.js';
import Config from '../Config.js';
import FileTree, { transformFileTree, getTreePaths } from '../components/FileTree.js';
import { Tabs, TabPanel } from '../ui/Tabs.js';
import IconButton from '../ui/IconButton.js';
import Spinner from '../ui/Spinner.js';
import NewFile from './NewFile.js';
import Toast from '../ui/Toast.js';
import ResizeBar from '../components/ResizeBar.js';

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
    return `http://${Config.plutoHost}/open?path=${encodeURIComponent(path.slice(1))}`;
}
function getNameFromPath(path) {
    return path.split('/').reverse()[0];
}

function Editor(props) {
    const [fileTree, setFileTree] = useState({});
    const [fileSelected, setFileSelected] = useState('');
    const [treeExpanded, setTreeExpanded] = useState({});

    const [tabIndex, setTabIndex] = useState(0);
    const [openTabs, setOpenTabs] = useState([]);

    const [newNotebookData, setNewNotebookData] = useState(null);
    const [globalErrors, setGlobalErrors] = useState([]);

    const [editorLeftWidth, setEditorLeftWidth] = useState(parseInt(localStorage.getItem('filesWidth') || '300'));

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
        fetch('/tree')
            .then(response => response.json())
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
    function handleFileAdd() {
        const openTabComponents = openTabs.map(x => x.component);
        if(openTabComponents.includes(NewFile)) {
            setTabIndex(openTabComponents.indexOf(NewFile));
        }
        else {
            const _openTabs = [ ...openTabs ];
            _openTabs.push({
                type: 'component',
                component: NewFile,
                name: "New File",
                props: {
                    onCreate: handleFileCreate
                }
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
        fetch('/fileMove?' + new URLSearchParams({
            src: paths[moveTreeId].slice(1),
            dst: paths[parentTreeId].slice(1) + paths[moveTreeId].split('/').reverse()[type === 'directory' ? 1 : 0],
        }))
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    handleFileRefresh(false);
                }
                else {
                    pushError('File Move Error', data.error);
                    console.log("Move error: ", data);
                }
            });
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
                            expanded=${treeExpanded}
                            onSelect=${handleFileSelected}
                            onExpand=${handleTreeExpand}
                            onMove=${handleFileMove}/>
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
        </div>
    `;
}

export default Editor;