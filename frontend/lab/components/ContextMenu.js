import { html } from '../deps/Preact.js';

function ContextMenuItem({ children, onClick, ...props }) {
    return html`<a class="dropdown-item" href="javascript:;" style="transition: background 0.2s" onmousedown=${onClick}>${children}</a>`;
}

function ContextMenuDivider({ ...props }) {
    return html`<div class="dropdown-divider"/>`;
}

function ContextMenu({ children, x, y, ...props }) {
    return html`
        <div class="dropdown-menu" style="position: absolute; top: ${y}px; left: ${x}px; display: block;">
            ${children}
        </div>
    `;
}

export { ContextMenuItem, ContextMenuDivider };
export default ContextMenu;
