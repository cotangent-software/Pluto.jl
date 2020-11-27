import { html } from './deps/Preact.js';
import Router from './deps/PreactRouter.js';

import Editor from './views/Editor.js';
import NewFile from './views/NewFile.js';

function App(props) {
    return html`
        <${Router}>
            <${Editor} path="/"/>
            <${NewFile} path="/test/newfile"/>
        </${Router}>
    `;
}
export default App;