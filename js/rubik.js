// Import local modules
import { initKeyHandler } from './keyHandler.js';
import { initAnimations } from './animations.js';
import { Motion, RealisticMotion } from './motion.js';

// Global variables
let scene, camera, renderer, controls;
let cubesArray3D = [];
let moveCount = 0;
let reverseMode = false;
let autoSolveMode = false;
let moveHistory = []; // Track moves for undo functionality
let rotationHistory = []; // Hidden history to store all rotations
let face_animation_status = {
    R: false, L: false, U: false, D: false, F: false, B: false
};

// Cube colors
const COLORS = {
    WHITE: 0xFFFFFF,
    YELLOW: 0xFFFF00,
    RED: 0xFF0000,
    ORANGE: 0xFF8C00,
    BLUE: 0x0000FF,
    GREEN: 0x00FF00,
    BLACK: 0x000000
};

// Initialize the scene
function initScene() {
    console.log('Initializing scene...');
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        return;
    }
    console.log('Three.js loaded successfully');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    console.log('Scene created');
    
    // Camera setup - positioned properly for 2x2 cube
    const container = document.getElementById('cube-container');
    if (!container) {
        console.error('Cube container not found!');
        return;
    }
    console.log('Container found:', container);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(3, 3, 3); // Optimal viewing angle for 2x2 cube
    camera.lookAt(0, 0, 0); // Look at the center of the cube
    console.log('Camera created at position:', camera.position);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xf8f9fa, 1);
    container.appendChild(renderer.domElement);
    console.log('Renderer created and added to container');
    console.log('Container dimensions:', container.clientWidth, 'x', container.clientHeight);
    
    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // for smoother motion
        controls.dampingFactor = 0.05; // smoother damping
        controls.rotateSpeed = 0.6;
        controls.enableZoom = true;
        controls.enablePan = false; // keep cube centered
        controls.minDistance = 2; // prevent getting too close
        controls.maxDistance = 8; // prevent getting too far
        controls.autoRotate = false; // no auto-rotation
        controls.enableKeys = false; // disable keyboard controls
        
        // Add event listeners for debugging
        controls.addEventListener('start', () => console.log('🔍 OrbitControls: Mouse interaction started'));
        controls.addEventListener('end', () => console.log('🔍 OrbitControls: Mouse interaction ended'));
        controls.addEventListener('change', () => console.log('🔍 OrbitControls: Camera position changed'));
        
        console.log('OrbitControls created with enhanced settings');
        console.log('🔍 Controls object:', controls);
        console.log('🔍 Camera position:', camera.position);
        console.log('🔍 Renderer DOM element:', renderer.domElement);
    } else {
        console.warn('OrbitControls not available');
        controls = null;
    }
    
    // Lighting - optimized for 2x2 cube visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);
    
    console.log('Lighting added - ambient and directional lights');
    
    // Create the 2x2 cube
    createCube();
    console.log('Cube created');
    
    // Debug: Log scene children to verify cubelets are added
    console.log('Scene children count:', scene.children.length);
    console.log('Scene children:', scene.children);
    
    // Initialize modules
    initKeyHandler();
    initAnimations();
    
    // Start render loop
    animate();
    console.log('Animation loop started');
}

// Create 2x2 cube (8 cubelets)
function createCube() {
    console.log('Creating 2x2 cube...');
    // Use tight spacing for compact 2x2x2 block
    const pos = [-0.55, 0.55];
    let cubeletCount = 0;
    
    // Initialize 3D array properly with integer indices
    cubesArray3D = [];
    for (let i = 0; i < 2; i++) {
        cubesArray3D[i] = [];
        for (let j = 0; j < 2; j++) {
            cubesArray3D[i][j] = [];
            for (let k = 0; k < 2; k++) {
                cubesArray3D[i][j][k] = null;
            }
        }
    }
    
    // Create cubelets at exact positions
    for (let x of pos) {
        for (let y of pos) {
            for (let z of pos) {
                const cubelet = createCubelet(x, y, z);
                cubelet.position.set(x, y, z);
                scene.add(cubelet);
                cubesArray3D[xIndex(x)][yIndex(y)][zIndex(z)] = cubelet;
                cubeletCount++;
                console.log(`Adding cubelet ${cubeletCount} at:`, x, y, z);
            }
        }
    }
    console.log(`Created ${cubeletCount} cubelets in a tight 2x2x2 configuration`);
}

// Create individual cubelet
function createCubelet(x, y, z) {
    // Use 1x1x1 geometry for tight packing
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [];
    
    // Define face colors based on position
    const colors = getCubeletColors(x, y, z);
    
    for (let i = 0; i < 6; i++) {
        materials.push(new THREE.MeshStandardMaterial({ 
            color: colors[i],
            metalness: 0.0,
            roughness: 0.5
        }));
    }
    
    const cubelet = new THREE.Mesh(geometry, materials);
    cubelet.userData = { originalPosition: { x, y, z } };
    
    return cubelet;
}

// Get colors for each face of a cubelet
function getCubeletColors(x, y, z) {
    const colors = new Array(6).fill(COLORS.BLACK);
    
    // Three.js BoxGeometry face order: right, left, top, bottom, front, back
    // Right face (x = 0.55) - RED
    if (x === 0.55) colors[0] = COLORS.RED;
    // Left face (x = -0.55) - ORANGE  
    if (x === -0.55) colors[1] = COLORS.ORANGE;
    // Top face (y = 0.55) - WHITE
    if (y === 0.55) colors[2] = COLORS.WHITE;
    // Bottom face (y = -0.55) - YELLOW
    if (y === -0.55) colors[3] = COLORS.YELLOW;
    // Front face (z = 0.55) - GREEN
    if (z === 0.55) colors[4] = COLORS.GREEN;
    // Back face (z = -0.55) - BLUE
    if (z === -0.55) colors[5] = COLORS.BLUE;
    
    return colors;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update(); // required for damping
    }
    renderer.render(scene, camera);
    
    // Debug: Log render status every 5 seconds
    if (Math.random() < 0.001) {
        console.log('Rendering scene with', scene.children.length, 'objects');
        console.log('🔍 Controls active:', !!controls);
        console.log('🔍 Camera position:', camera.position);
    }
}

// Position mapping helper functions
function xIndex(val) { return val === -0.55 ? 0 : 1; }
function yIndex(val) { return val === -0.55 ? 0 : 1; }
function zIndex(val) { return val === -0.55 ? 0 : 1; }

// Function to update cubelet positions in the 3D array after rotation
function updateCubeletPositionsAfterRotation(rotatedCubelets) {
    // Get all cubelets from the scene
    const allCubelets = [];
    scene.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.type === 'BoxGeometry') {
            allCubelets.push(child);
        }
    });
    
    // Clear the 3D array
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
                cubesArray3D[i][j][k] = null;
            }
        }
    }
    
    // Re-populate the 3D array with current cubelet positions
    for (let cubelet of allCubelets) {
        const x = Math.round(cubelet.position.x * 100) / 100; // Round to 2 decimal places
        const y = Math.round(cubelet.position.y * 100) / 100;
        const z = Math.round(cubelet.position.z * 100) / 100;
        
        const xIdx = xIndex(x);
        const yIdx = yIndex(y);
        const zIdx = zIndex(z);
        
        if (xIdx >= 0 && xIdx < 2 && yIdx >= 0 && yIdx < 2 && zIdx >= 0 && zIdx < 2) {
            cubesArray3D[xIdx][yIdx][zIdx] = cubelet;
        }
    }
    
    console.log(`🔍 DEBUG: Updated 3D array after rotation. Total cubelets: ${allCubelets.length}`);
}

// Utility functions
function round(num) {
    return Math.round(num * 10) / 10;
}

function resetCubeObject() {
    // Stop auto-solve if it's running
    if (autoSolveMode) {
        stopAutoSolve();
    }
    
    // Reset all cubelets to original positions
    const pos = [-0.55, 0.55];
    for (let x of pos) {
        for (let y of pos) {
            for (let z of pos) {
                const cubelet = cubesArray3D[xIndex(x)][yIndex(y)][zIndex(z)];
                if (cubelet) {
                    const originalPos = cubelet.userData.originalPosition;
                    cubelet.position.set(originalPos.x, originalPos.y, originalPos.z);
                    cubelet.rotation.set(0, 0, 0);
                }
            }
        }
    }
    moveCount = 0;
    updateMoveCounter();
    
    // Clear move history but keep rotation history for analysis
    moveHistory = [];
    console.log('Cube reset to solved state');
    console.log('🔍 Hidden History: Move history cleared, rotation history preserved');
}

function scrambleCube() {
    // Stop auto-solve if it's running
    if (autoSolveMode) {
        stopAutoSolve();
    }
    
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    const numMoves = 10; // 10 random moves for 2x2
    
    console.log('🔍 Hidden History: Starting scramble sequence');
    
    for (let i = 0; i < numMoves; i++) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const randomDirection = Math.random() > 0.5 ? 1 : 2;
        setTimeout(() => {
            executeMove(randomMove, randomDirection, 'scramble');
        }, i * 700); // Wait for previous animation to complete
    }
    console.log('Scrambling cube with 10 random moves');
}

function updateMoveCounter() {
    document.getElementById('move-counter').textContent = moveCount;
}

function updateModeDisplays() {
    document.getElementById('reverse-mode').textContent = `Reverse: ${reverseMode ? 'ON' : 'OFF'}`;
    document.getElementById('auto-solve-mode').textContent = `Auto-Solve: ${autoSolveMode ? 'ON' : 'OFF'}`;
}

// Hidden rotation history management
function addToRotationHistory(move, direction, source = 'user') {
    const historyEntry = {
        move: move,
        direction: direction,
        source: source, // 'user', 'scramble', 'auto-solve'
        timestamp: Date.now(),
        moveNumber: moveCount + 1
    };
    
    rotationHistory.push(historyEntry);
    
    // Keep only last 1000 moves to prevent memory issues
    if (rotationHistory.length > 1000) {
        rotationHistory = rotationHistory.slice(-1000);
    }
    
    console.log(`🔍 Hidden History: Added ${move}${direction} (${source}) - Total: ${rotationHistory.length}`);
}

function getRotationHistory() {
    return rotationHistory;
}

function clearRotationHistory() {
    rotationHistory = [];
    console.log('🔍 Hidden History: Cleared');
}

function getHistoryStats() {
    const stats = {
        total: rotationHistory.length,
        bySource: {},
        byMove: {},
        recent: rotationHistory.slice(-10) // Last 10 moves
    };
    
    // Count by source
    rotationHistory.forEach(entry => {
        stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;
        stats.byMove[entry.move] = (stats.byMove[entry.move] || 0) + 1;
    });
    
    return stats;
}

function exportHistoryData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        totalMoves: rotationHistory.length,
        history: rotationHistory,
        stats: getHistoryStats(),
        sessionInfo: {
            startTime: rotationHistory.length > 0 ? new Date(rotationHistory[0].timestamp).toISOString() : null,
            endTime: rotationHistory.length > 0 ? new Date(rotationHistory[rotationHistory.length - 1].timestamp).toISOString() : null,
            duration: rotationHistory.length > 0 ? rotationHistory[rotationHistory.length - 1].timestamp - rotationHistory[0].timestamp : 0
        }
    };
    
    return exportData;
}

// Export functions for other modules
export function executeMove(move, direction, source = 'user') {
    console.log(`🔍 DEBUG: executeMove called with move: ${move}, direction: ${direction}, source: ${source}`);
    if (face_animation_status[move]) {
        console.log(`🔍 DEBUG: Face ${move} is already animating, skipping`);
        return;
    }
    
    // Map move to face and call realistic 2x2 rotation
    switch (move) {
        case 'R': rotate2x2Face('R', direction); break;
        case 'L': rotate2x2Face('L', direction); break;
        case 'U': rotate2x2Face('U', direction); break;
        case 'D': rotate2x2Face('D', direction); break;
        case 'F': rotate2x2Face('F', direction); break;
        case 'B': rotate2x2Face('B', direction); break;
        default:
            console.log(`🔍 DEBUG: Unknown move: ${move}`);
            return;
    }
    
    // Add to move history for undo functionality
    moveHistory.push({ move, direction, timestamp: Date.now() });
    
    // Add to hidden rotation history
    addToRotationHistory(move, direction, source);
    
    moveCount++;
    updateMoveCounter();
}

// EPS to handle float precision
const EPS = 0.01;

// Rotation mapping for each face with axis, coordinate value, and direction
const rotationMap = {
    U: { axis: 'y', value: 0.55, dir: -1 },
    D: { axis: 'y', value: -0.55, dir: 1 },
    L: { axis: 'x', value: -0.55, dir: -1 },
    R: { axis: 'x', value: 0.55, dir: 1 },
    F: { axis: 'z', value: 0.55, dir: -1 },
    B: { axis: 'z', value: -0.55, dir: 1 },
};

// Get all cubelets from the scene
function getAllCubelets() {
    const allCubelets = [];
    scene.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.type === 'BoxGeometry') {
            allCubelets.push(child);
        }
    });
    return allCubelets;
}

// Select cubelets for a specific face using rounded coordinate checks
function getFaceCubelets(face) {
    const { axis, value } = rotationMap[face];
    const allCubelets = getAllCubelets();
    return allCubelets.filter(c => Math.abs(c.position[axis] - value) < EPS);
}

// Simple and reliable face rotation that behaves exactly like a real Rubik's Cube
export function rotate2x2Face(face, direction) {
    console.log(`🔍 DEBUG: rotate2x2Face called with face: ${face}, direction: ${direction}`);
    
    // Check if face is already animating
    if (face_animation_status[face]) {
        console.log(`🔍 DEBUG: Face ${face} is already animating, skipping`);
        return;
    }
    
    // Set animation status for the face
    face_animation_status[face] = true;
    
    // Get cubelets for this face
    const selected = getFaceCubelets(face);
    
    console.log(`🔍 DEBUG: Face: ${face}, Cubelets found: ${selected.length}`);
    
    if (selected.length === 0) {
        console.error(`🔍 ERROR: No cubelets found for face ${face}`);
        face_animation_status[face] = false;
        return;
    }
    
    // Get rotation configuration
    const { axis, dir } = rotationMap[face];
    const reverse = (direction === 2);
    const angle = (Math.PI / 2) * (reverse ? -dir : dir);
    
    console.log(`🔍 DEBUG: Face: ${face}, Axis: ${axis}, Direction: ${dir}, Reverse: ${reverse}, Final angle: ${angle}`);
    
    // Store initial positions and rotations
    const initialStates = selected.map(cubelet => ({
        position: cubelet.position.clone(),
        rotation: cubelet.rotation.clone()
    }));
    
    // Create rotation matrix
    const rotationMatrix = new THREE.Matrix4();
    const rotationAxis = new THREE.Vector3();
    
    switch (axis) {
        case 'x': rotationAxis.set(1, 0, 0); break;
        case 'y': rotationAxis.set(0, 1, 0); break;
        case 'z': rotationAxis.set(0, 0, 1); break;
    }
    
    rotationMatrix.makeRotationAxis(rotationAxis, angle);
    
    // Animate the rotation
    const duration = 400;
    const startTime = Date.now();
    
    function animateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentAngle = angle * easedProgress;
        
        // Apply rotation to each cubelet
        selected.forEach((cubelet, index) => {
            const initialState = initialStates[index];
            
            // Reset to initial state
            cubelet.position.copy(initialState.position);
            cubelet.rotation.copy(initialState.rotation);
            
            // Apply current rotation
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.makeRotationAxis(rotationAxis, currentAngle);
            cubelet.applyMatrix4(tempMatrix);
        });
        
        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            // Animation complete
            updateCubeletPositionsAfterRotation(selected);
            face_animation_status[face] = false;
            console.log(`${face} face rotation completed - all cubelets moved as solid unit`);
        }
    }
    
    animateRotation();
}

export function toggleReverse() {
    reverseMode = !reverseMode;
    updateModeDisplays();
}

export function autoSolve() {
    if (autoSolveMode) {
        // If already in auto-solve mode, stop it
        autoSolveMode = false;
        updateModeDisplays();
        console.log('🔍 Auto-solve mode disabled');
        return;
    }
    
    // Start auto-solve process
    autoSolveMode = true;
    updateModeDisplays();
    console.log('🔍 Auto-solve mode enabled - starting solve sequence');
    
    // Get the current rotation history to reverse
    const currentHistory = [...rotationHistory];
    
    if (currentHistory.length === 0) {
        console.log('🔍 No moves to reverse - cube is already solved');
        autoSolveMode = false;
        updateModeDisplays();
        return;
    }
    
    // Reverse the history (last move first)
    const reversedMoves = currentHistory.reverse();
    
    console.log(`🔍 Auto-solve: Reversing ${reversedMoves.length} moves`);
    
    // Execute reversed moves with delay
    reversedMoves.forEach((moveEntry, index) => {
        const delay = index * 600; // 600ms between moves
        
        setTimeout(() => {
            if (!autoSolveMode) {
                console.log('🔍 Auto-solve cancelled');
                return;
            }
            
            // Reverse the direction (1 becomes 2, 2 becomes 1)
            const reversedDirection = moveEntry.direction === 1 ? 2 : 1;
            
            console.log(`🔍 Auto-solve: Move ${index + 1}/${reversedMoves.length} - ${moveEntry.move}${reversedDirection} (reversing ${moveEntry.move}${moveEntry.direction})`);
            
            executeMove(moveEntry.move, reversedDirection, 'auto-solve');
            
            // Check if this is the last move
            if (index === reversedMoves.length - 1) {
                setTimeout(() => {
                    autoSolveMode = false;
                    updateModeDisplays();
                    console.log('🔍 Auto-solve completed - cube should be solved');
                    
                    // Clear the rotation history after successful solve
                    clearRotationHistory();
                    console.log('🔍 Rotation history cleared after auto-solve');
                }, 1000);
            }
        }, delay);
    });
}

export function resetCube() {
    resetCubeObject();
}

// Global functions for HTML buttons
window.scrambleCube = scrambleCube;
window.resetCube = resetCube;
window.autoSolve = autoSolve;
window.toggleReverse = toggleReverse;

// Hidden history functions (for debugging/development)
window.getRotationHistory = getRotationHistory;
window.getHistoryStats = getHistoryStats;
window.clearRotationHistory = clearRotationHistory;
window.exportHistoryData = exportHistoryData;

// Auto-solve control function
function stopAutoSolve() {
    if (autoSolveMode) {
        autoSolveMode = false;
        updateModeDisplays();
        console.log('🔍 Auto-solve stopped by user');
    }
}

window.stopAutoSolve = stopAutoSolve;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM loaded, initializing scene...');
    initScene();
    
    // Test controls after a short delay
    setTimeout(() => {
        console.log('🔍 Testing controls after initialization...');
        console.log('🔍 Controls object:', controls);
        console.log('🔍 Camera position:', camera?.position);
        console.log('🔍 Scene children:', scene?.children.length);
        
        if (controls) {
            console.log('🔍 OrbitControls properties:');
            console.log('  - enableDamping:', controls.enableDamping);
            console.log('  - enableZoom:', controls.enableZoom);
            console.log('  - enablePan:', controls.enablePan);
            console.log('  - rotateSpeed:', controls.rotateSpeed);
        }
    }, 1000);
});

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.getElementById('cube-container');
    if (container && camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        console.log('Window resized, updated camera and renderer');
    }
}); 