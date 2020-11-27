import { html } from '../deps/Preact.js';
import IconButton from './IconButton.js';

function Tabs({ tab, tabLabels, onClick, onClose=(i)=>{}, className, ...props }) {
    className = className || '';
    tabLabels = tabLabels || [];
    return html`
        <div class="tabs-container ${className}">
            ${tabLabels.map((content, i) => (
                html`
                    <div class="${i === tab ? 'tabs-tab-active ' : ''}tabs-tab" onclick=${() => onClick(i)}>
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