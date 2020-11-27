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

function Editor(props) {
    const [fileTree, setFileTree] = useState({});
    const [fileSelected, setFileSelected] = useState('');
    const [treeExpanded, setTreeExpanded] = useState({});

    const [tabIndex, setTabIndex] = useState(0);
    const [openTabs, setOpenTabs] = useState([]);

    useEffect(() => {
        handleFileRefresh();
    }, [setFileTree]);

    function handleFileRefresh() {
        setFileTree({});    
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
                    url: `http://${Config.plutoHost}/open?path=${encodeURIComponent(path.slice(1))}`,
                    path,
                    name: path.split('/').reverse()[0]
                });
                setOpenTabs(_openTabs);
                setTabIndex(_openTabs.length-1);
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
                name: "New File"
            });
            setOpenTabs(_openTabs);
            setTabIndex(_openTabs.length-1);
        }
    }
    function handleTreeExpand(tree, expanded) {
        const _treeExpanded = { ...treeExpanded };
        _treeExpanded[tree.id] = expanded;
        setTreeExpanded(_treeExpanded);
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
        if(idx <= tabIndex) setTabIndex(tabIndex - 1);
    }
    function handleFrameLoad(idx) {
        
    }

    return html`
        <div class="editor-container">
            <div class="editor-left p-3 pl-4">
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
                            onExpand=${handleTreeExpand}/>
                    `
                }
            </div>
            <div class="editor-center"></div>
            <div class="editor-right">
                <${Tabs}
                    tab="${tabIndex}"
                    tabLabels="${openTabs.map(x => x.name)}"
                    onClick=${handleTabClick}
                    onClose=${handleTabClose}/>
                ${openTabs.map((tabData, i) => (
                    html`
                        <${TabPanel} tab=${tabIndex} index=${i} style="flex-grow: 1; position: relative">
                            ${tabData.type === 'frame' && html`<iframe class="pluto-frame" src="${tabData.url}" onload=${handleFrameLoad(i)}></iframe>`}
                            ${tabData.type === 'component' && html`<${tabData.component} ...${tabData.props || {}}/>`}
                        </${TabPanel}>
                    `
                ))}
            </div>
        </div>
    `;
}

export default Editor;