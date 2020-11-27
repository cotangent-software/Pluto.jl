import { html } from './deps/Preact.js';
import Router from './deps/PreactRouter.js';

import Editor from './views/Editor.js';

function App(props) {
    return html`
        <${Router}>
            <${Editor} path="/"/>
        </${Router}>
    `;
}
export default App;