import { html } from '../deps/Preact.js';
import Icon from './Icon.js';

function IconButton({ icon, size=32, buttonSize=36, onClick, className='', style, ...props }) {
    return html`
        <button class="icon-button ${className}" style="width: ${buttonSize}px; height: ${buttonSize}px; ${style}" onclick=${onClick} ...${props}>
            <${Icon} name=${icon} size=${size}/>
        </button>
    `;
}

export default IconButton;