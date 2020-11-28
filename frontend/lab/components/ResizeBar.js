import { html, useState, useEffect } from '../deps/Preact.js'

function Vertical({ onChange, ...props }) {
    const [mouseDown, setMouseDown] = useState(false);

    function setFramePointerEvents(val) {
        const frames = document.getElementsByTagName('iframe');
        for(let i=0; i<frames.length; i++) {
            frames[i].style.pointerEvents = val;
        }
    }

    function handleMouseMove(e) {
        if(mouseDown && (e.x !== 0 || e.y !== 0)) {
            onChange(e.x, e.y);
        }
    }
    function handleMouseDown() {
        setMouseDown(true);
        setFramePointerEvents('none');
    }
    function handleMouseUp(e) {
        setMouseDown(false);
        setFramePointerEvents('');
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseMove]);

    return html`
        <div class="resize-bar-container">
            <div class="resize-bar-left" onmousedown=${handleMouseDown}/>
            <div class="resize-bar-right" onmousedown=${handleMouseDown}/>
        </div>
    `;
}

const ResizeBar = { Vertical };

export default ResizeBar;