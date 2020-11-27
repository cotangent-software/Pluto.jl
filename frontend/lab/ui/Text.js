import { html } from '../deps/Preact.js';

function Text({ children, variant, muted, lead, className, ...props }) {
    return html`
        <p class="${variant || ''}${muted ? ' text-muted' : ''}${lead ? ' lead' : ''} ${className || ''}" ...${props}>
            ${children}
        </p>
    `;
}

export default Text;