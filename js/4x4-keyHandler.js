import { executeMove } from './4x4-rubik.js';

let reverseMode = false;
let moveHistory = [];

function initKeyHandler() {
    document.addEventListener('keydown', handleKeyPress);
    console.log('4x4 Key handler initialized');
}

function handleKeyPress(event) {
    // Prevent default behavior for game keys
    const gameKeys = ['KeyR', 'KeyL', 'KeyU', 'KeyD', 'KeyF', 'KeyB', 'Digit1', 'Digit2', 'KeyT'];
    if (gameKeys.includes(event.code)) {
        event.preventDefault();
    }
    
    // Check if animation is currently running - block all moves during animation
    if (window.isCurrentlyAnimating && window.isCurrentlyAnimating()) {
        console.log('Animation in progress, ignoring key press');
        return;
    }
    
    let move = null;
    let direction = 1;
    
    // Handle face rotation keys
    switch (event.code) {
        // Outer face moves
        case 'KeyR':
            if (event.shiftKey) {
                move = 'r'; // Inner right
            } else {
                move = 'R'; // Outer right
            }
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyL':
            if (event.shiftKey) {
                move = 'l'; // Inner left
            } else {
                move = 'L'; // Outer left
            }
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyU':
            if (event.shiftKey) {
                move = 'u'; // Inner up
            } else {
                move = 'U'; // Outer up
            }
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyD':
            if (event.shiftKey) {
                move = 'd'; // Inner down
            } else {
                move = 'D'; // Outer down
            }
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyF':
            if (event.shiftKey) {
                move = 'f'; // Inner front
            } else {
                move = 'F'; // Outer front
            }
            direction = reverseMode ? 2 : 1;
            break;
        case 'KeyB':
            if (event.shiftKey) {
                move = 'b'; // Inner back
            } else {
                move = 'B'; // Outer back
            }
            direction = reverseMode ? 2 : 1;
            break;
        
        // Direction controls
        case 'Digit1':
            direction = 1;
            console.log('Direction set to normal (1)');
            return;
        case 'Digit2':
            direction = 2;
            console.log('Direction set to reverse (2)');
            return;
        case 'KeyT':
            toggleReverseMode();
            return;
    }
    
    // Execute move if valid
    if (move) {
        console.log(`Key pressed: ${move} with direction ${direction}`);
        executeMove(move, direction, 'user');
    }
    
    // Handle undo (Ctrl+Z)
    if (event.ctrlKey && event.code === 'KeyZ') {
        undoLastMove();
    }
}

function toggleReverseMode() {
    reverseMode = !reverseMode;
    console.log(`Reverse mode: ${reverseMode ? 'ON' : 'OFF'}`);
    updateReverseModeDisplay();
}

function updateReverseModeDisplay() {
    const reverseElement = document.getElementById('reverse-mode');
    if (reverseElement) {
        reverseElement.textContent = `🔄 Reverse: ${reverseMode ? 'ON' : 'OFF'}`;
    }
}

function undoLastMove() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        const oppositeDirection = lastMove.direction === 1 ? 2 : 1;
        executeMove(lastMove.move, oppositeDirection, 'user');
    }
}

export { initKeyHandler }; 