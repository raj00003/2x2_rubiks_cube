import { executeMove } from './rubik.js';

let reverseMode = false;
let moveHistory = [];

function initKeyHandler() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    // Prevent default behavior for game keys
    const gameKeys = ['KeyR', 'KeyL', 'KeyU', 'KeyD', 'KeyF', 'KeyB', 'Digit1', 'Digit2', 'KeyT'];
    if (gameKeys.includes(event.code)) {
        event.preventDefault();
    }
    
    let move = null;
    let direction = 1;
    
    // Handle face rotation keys
    switch (event.code) {
        case 'KeyR':
            move = 'R';
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyL':
            move = 'L';
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyU':
            move = 'U';
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyD':
            move = 'D';
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyF':
            move = 'F';
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyB':
            move = 'B';
            direction = reverseMode ? 2 : 1;
            break;
        case 'Digit1':
            direction = 1;
            break;
        case 'Digit2':
            direction = 2;
            break;
        case 'KeyT':
            toggleReverseMode();
            return;
    }
    
    // Handle direction override
    if (event.code === 'Digit1' || event.code === 'Digit2') {
        // If a face key was pressed recently, apply the direction
        const lastMove = moveHistory[moveHistory.length - 1];
        if (lastMove && lastMove.timestamp > Date.now() - 500) {
            executeMove(lastMove.move, direction);
            return;
        }
    }
    
    // Execute move if valid
    if (move) {
        executeMove(move, direction);
        moveHistory.push({
            move: move,
            direction: direction,
            timestamp: Date.now()
        });
    }
    
    // Handle undo (Ctrl+Z)
    if (event.ctrlKey && event.code === 'KeyZ') {
        undoLastMove();
    }
}

function toggleReverseMode() {
    reverseMode = !reverseMode;
    updateReverseModeDisplay();
}

function updateReverseModeDisplay() {
    const reverseElement = document.getElementById('reverse-mode');
    if (reverseElement) {
        reverseElement.textContent = `Reverse: ${reverseMode ? 'ON' : 'OFF'}`;
    }
}

function undoLastMove() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        const oppositeDirection = lastMove.direction === 1 ? 2 : 1;
        executeMove(lastMove.move, oppositeDirection);
    }
}

export { initKeyHandler }; 