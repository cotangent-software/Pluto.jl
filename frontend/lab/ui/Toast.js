import { html, useEffect, useState } from '../deps/Preact.js';

function Toast({ title, severity='default', extra='', children, timeout=null, open=true, onClose, ...props }) {
    const [timeoutHandle, setTimeoutHandle] = useState(null);
 
    useEffect(() => {
        if(timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
        if(timeout !== null) {
            setTimeoutHandle(setTimeout(onClose, timeout));
        }
    }, [onClose]);

    const severityBg = {
        default: 'white',
        danger: '#f8d7da'
    };
    const severityBc = {
        default: 'rgba(0,0,0,.1)',
        danger: '#f5c6cb'
    };
    const severityTc = {
        default: 'black',
        danger: '#721c24'
    };
    return html`
        <div class="toast" aria-live="assertive" style="
            max-width: 700px;
            overflow-wrap: break-word;
            opacity: 1; 
            background-color: ${severityBg[severity]};
            border-color: ${severityBc[severity]};
            color: ${severityTc[severity]};
            display: ${open ? 'block' : 'none'}
        ">
            <div class="toast-header" style="background-color: ${severityBc[severity]}">
                <strong class="mr-auto">${title}</strong>
                <small>${extra}</small>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" onclick=${onClose}>
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="toast-body">
                ${children}
            </div>
        </div>
    `;
}

export default Toast;