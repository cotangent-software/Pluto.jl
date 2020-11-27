import { html, useState } from '../deps/Preact.js';
import IconButton from './IconButton.js';

function Tabs({ tab, tabLabels, onClick, onTabRearrange, onClose=(i)=>{}, className, ...props }) {
    const [dragTab, setDragTab] = useState(-1);

    className = className || '';
    tabLabels = tabLabels || [];

    function handleDragStart(tabIndex) {
        return (e) => {
            setDragTab(tabIndex);
            e.dataTransfer.setData('tabIndex', tabIndex);
        };
    }
    function handleDragOver(tabIndex) {
        return (e) => {
            e.preventDefault();
            if(tabIndex !== dragTab) {
                e.currentTarget.style.background = '#ededed';
            }
        };
    }
    function handleDragLeave(tabIndex) {
        return (e) => {
            e.currentTarget.style.background = '';
        };
    }
    function handleDrop(tabIndex) {
        return (e) => {
            e.currentTarget.style.background = '';
            let droppedTab = e.dataTransfer.getData('tabIndex');
            if(droppedTab) {
                droppedTab = parseInt(droppedTab);
                const tabArrangement = Array.apply(null, Array(tabLabels.length)).map((x, i) => i);
                tabArrangement.splice(droppedTab, 1);
                tabArrangement.splice(tabIndex, 0, droppedTab);

                onTabRearrange(tabArrangement);
            }
        };
    }

    return html`
        <div class="tabs-container ${className}">
            ${tabLabels.map((content, i) => (
                html`
                    <div
                        class="${i === tab ? 'tabs-tab-active ' : ''}tabs-tab"
                        draggable="true"
                        ondragstart=${handleDragStart(i)}
                        ondragover=${handleDragOver(i)}
                        ondragleave=${handleDragLeave(i)}
                        ondrop=${handleDrop(i)}
                        onmousedown=${() => onClick(i)}
                    >
                        <div class="tabs-tab-content">
                            ${content}
                            <${IconButton} icon="x" className="ml-1" buttonSize=20 onClick=${(e) => {
                                e.stopPropagation();
                                onClose(i);
                            }}/>
                        </div>
                    </div>
                `
            ))}
            <div style="flex-grow: 1; border-bottom: 1px solid lightgray"/>
        </div>
    `;
}

function TabPanel({ tab, index, style, children, ...props }) {
    return html`
        <div style="display: ${tab === index ? 'block' : 'none'}; ${style || ''}" ...${props}>
            ${children}
        </div>
    `;
}

export { Tabs, TabPanel };