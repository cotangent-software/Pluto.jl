import { html } from '../deps/Preact.js';

function Spinner({ className='', ...props }) {
    return html`
        <div class="spinner-border ${className}" role="status" ...${props}>
            <span class="sr-only">Loading...</span>
        </div>
    `;
}

export default Spinner;