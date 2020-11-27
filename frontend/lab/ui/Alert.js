import { html } from '../deps/Preact.js';

function Alert({ severity='primary', children }) {
    return html`
        <div class="alert alert-${severity}" role="alert">
            ${children}
        </div>
    `;
}

export default Alert;