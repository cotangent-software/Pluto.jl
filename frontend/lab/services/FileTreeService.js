function normalizePath(path) {
    if(['/', '\\'].includes(path.charAt(0))) return path.slice(1);
    return path;
}
function getFileName(path) {
    const reversedSplit = path.split('/').reverse();
    return reversedSplit[reversedSplit[0] === '' ? 1 : 0]
}
function getTree() {
    return new Promise((resolve, reject) => {
        fetch('/tree')
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(reject);
    });
}
function moveFile(src, dst) {
    return new Promise((resolve, reject) => {
        fetch('/fileMove?' + new URLSearchParams({
            src: normalizePath(src),
            dst: normalizePath(dst),
        }))
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    resolve(data);
                }
                else {
                    reject(data.error);
                }
            });
    });
}

export default { normalizePath, getFileName, getTree, moveFile };