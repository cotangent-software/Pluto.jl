import { html, useState } from '../deps/Preact.js';
import Alert from '../ui/Alert.js';
import Container from '../ui/Container.js';
import Grid from '../ui/Grid.js';
import Spinner from '../ui/Spinner.js';
import Text from '../ui/Text.js';

function NewFileButton({ children, onClick, backgroundImage='', backgroundOpacity=0.2, ...props }) {
    return html`
        <button class="new-file-button" onclick=${onClick}>
            <div class="new-file-button-background" style="background-image: url(${backgroundImage}); filter: opacity(${backgroundOpacity})"/>
            <div class="new-file-button-text">
                <span>${children}</span>
            </div>
        </button>
    `;
}

function NewFile({ onCreate=(d)=>{}, ...props }) {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [showExtensionWarning, setShowExtensionWarning] = useState(false);

    function handleFileNameChange(e) {
        const _fileName = e.target.value;
        setFileName(_fileName);
        if(_fileName.includes('.')) {
            setShowExtensionWarning(true);
        }
        else {
            setShowExtensionWarning(false);
        }
    }

    function correctedFileName(fileName) {
        if(fileName.slice(fileName.length-3, fileName.length) !== '.jl') {
            return fileName + (fileName.charAt(fileName.length-1) === '.' ? '' : '.') + 'jl';
        }
        return fileName;
    }

    function handleCreatePlutoNotebook() {
        setLoading(true);
        fetch('/new' + (fileName !== '' ? '?path=' + encodeURIComponent(correctedFileName(fileName)) : ''))
            .then(response => response.json())
            .then(data => {
                if(data && data.path) {
                    onCreate(data);
                }
                setLoading(false);
            });
    }

    return html`
        <div class="new-file-root pt-5">
        <div class="new-file-container">
            <${Text} variant="display-4">Create a New File</${Text}>
            <div class="form-group">
                <label for="fileName">File Name</label>
                <input type="text" class="form-control" id="fileName" aria-describedby="fileNameHelp" placeholder="<Random>" value=${fileName} onkeyup=${handleFileNameChange}/>
                <small id="fileNameHelp" class="form-text text-muted">If left blank a random name will be generated</small>
            </div>
            ${showExtensionWarning && html`
                <${Alert} severity="warning">
                    File extensions do not need to be included but will take precedence over the default extension if one is present.
                </${Alert}>
            `}
            <${Container}>
                <${Grid.Row}>
                    <${Grid.Col} sm=6>
                        <${NewFileButton} onClick=${handleCreatePlutoNotebook} backgroundImage="/img/favicon.svg">${loading ? html`<${Spinner}/>` : 'Pluto Notebook'}</${NewFileButton}>
                    </${Grid.Col}>
                    <${Grid.Col} sm=6>
                        <${NewFileButton} backgroundImage="/lab/deps/bootstrap-icons/file-earmark-text.svg" backgroundOpacity=0.1>Text File</${NewFileButton}>
                    </${Grid.Col}>
                </${Grid.Row}>
            </${Container}>
        </div>
        </div>
    `;
}

export default NewFile;