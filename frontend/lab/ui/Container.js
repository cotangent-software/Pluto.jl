import { html } from '../deps/Preact.js';

function Container({ fluid, maxWidth, className, children, ...props}) {
    let containerClass = 'container';
    if(fluid) {
        containerClass += '-fluid';
    }
    else if(maxWidth) {
        containerClass += '-' + maxWidth;
    }
    return html`
        <div class="${containerClass} ${className || ''}" ...${props}>
            ${children}
        </div>
    `;
}
export default Container;