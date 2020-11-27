import { html } from '../deps/Preact.js';

function Icon({ name, size=16, ...props }) {
    return html`<img src="/lab/deps/bootstrap-icons/${name}.svg" width=${size} height=${size} ...${props}/>`
}

export default Icon;