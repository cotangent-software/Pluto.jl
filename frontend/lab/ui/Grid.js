import { html } from '../deps/Preact.js';

function Row({ children, cols, className, ...props }) {
    const colsClass = cols ? 'row-cols-' + cols : '';
    return html`
        <div class="row ${colsClass} ${className || ''}" ...${props}>
            ${children}
        </div>
    `;
}

function Col({ children, className, sm, md, lg, xl, ...props }) {
    sm = sm || '';
    md = md || '';
    lg = lg || '';
    xl = xl || '';
    return html`
        <div class="${!sm && !md && !lg && !xl && 'col'}${sm && ' col-sm-' + sm}${md && ' col-md-' + md}${lg && ' col-lg-' + lg}${xl && ' col-xl-' + xl} ${className || ''}" ...${props}>
            ${children}
        </div>
    `;
}

const Grid = { Row, Col };

export default Grid;