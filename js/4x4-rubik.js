// Remove the comment and properly import the key handler
import { initKeyHandler } from './4x4-keyHandler.js';

// Global variables
let scene, camera, renderer, controls;
let cubesArray3D = [];
let moveCount = 0;
let reverseMode = false;
let autoSolveMode = false;
let moveHistory = []; // Global move history array for auto-solve
let rotationHistory = []; // Hidden history to store all rotations
let scrambleHistory = []; // Store scramble moves for auto-solve
let face_animation_status = {
    R: false, L: false, U: false, D: false, F: false, B: false,
    r: false, l: false, u: false, d: false, f: false, b: false
};

// Animation and rotation control variables
let isAnimating = false; // Global animation lock
let lastKeyPressTime = 0; // For debouncing key presses
let keyDebounceDelay = 350; // Minimum time between key presses (ms)
let currentRotationGroup = null; // Temporary group for rotating cubelets

// Mouse drag variables for cube rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cubeGroup; // Master group containing all cubelets

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
    console.log('Initializing 4x4 scene...');
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        return;
    }
    console.log('Three.js loaded successfully');
    
    scene = new THREE.Scene();
    
    // ✅ Create space-like background
    // Deep space gradient background
    const spaceGradient = new THREE.Color(0x0a0e27); // Deep space blue
    scene.background = spaceGradient;
    console.log('Scene created with space background');
    
    // Camera setup - positioned properly for 4x4 cube
    const container = document.getElementById('cube-container');
    if (!container) {
        console.error('Cube container not found!');
        return;
    }
    console.log('Container found:', container);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 4); // Position for 4x4 cube
    camera.lookAt(0, 0, 0); // Look at the center of the cube
    console.log('Camera created at position:', camera.position);
    
    // Renderer setup with space background
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0a0e27, 1); // Deep space blue
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    console.log('Renderer created and added to container');
    console.log('Container dimensions:', container.clientWidth, 'x', container.clientHeight);
    
    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // for smoother motion
        controls.dampingFactor = 0.05; // smoother damping
        controls.rotateSpeed = 1.0; // increased for better responsiveness
        controls.enableZoom = true;
        controls.enablePan = false; // keep cube centered
        controls.minDistance = 3; // allow getting closer for bigger view
        controls.maxDistance = 10; // limit maximum distance
        controls.autoRotate = false; // no auto-rotation
        controls.enableKeys = false; // disable keyboard controls
        controls.target.set(0, 0, 0); // ensure target is at cube center
        
        console.log('OrbitControls created with enhanced settings');
    } else {
        console.warn('OrbitControls not available, using basic mouse controls');
        setupMouseDragEvents();
    }
    
    // ✅ Enhanced space lighting
    // Ambient light for overall space illumination
    const ambientLight = new THREE.AmbientLight(0x1a1f3a, 0.4); // Deep blue ambient
    scene.add(ambientLight);
    
    // Main directional light (like a distant star)
    const directionalLight1 = new THREE.DirectionalLight(0x4a90e2, 0.8); // Blue-white star light
    directionalLight1.position.set(10, 10, 10);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);
    
    // Secondary directional light for depth
    const directionalLight2 = new THREE.DirectionalLight(0x2d3a5f, 0.3); // Deep blue secondary
    directionalLight2.position.set(-8, -8, -8);
    scene.add(directionalLight2);
    
    // ✅ Add space particles/stars
    createSpaceParticles();
    
    // Create master cube group
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    console.log('Cube group created and added to scene');
    
    // Create the 4x4 cube
    createCube();
    console.log('4x4 cube created successfully');
    
    // Setup mouse drag events
    setupMouseDragEvents();
    
    // Initialize key handler
    try {
        initKeyHandler();
        console.log('Key handler initialized successfully');
    } catch (error) {
        console.error('Failed to initialize key handler:', error);
        // Fallback: Add basic key handler directly
        document.addEventListener('keydown', handleKeyPress);
        console.log('Fallback key handler added');
    }
    
    console.log('4x4 Scene initialization complete with space theme');
}

// Create 4x4 cube with 64 cubelets
function createCube() {
    console.log('Creating 4x4 cube...');
    // Use positions for 4x4 cube with proper spacing
    const pos = [-1.5, -0.5, 0.5, 1.5];
    let cubeletCount = 0;
    
    // Initialize 4D array properly with integer indices
    cubesArray3D = [];
    for (let i = 0; i < 4; i++) {
        cubesArray3D[i] = [];
        for (let j = 0; j < 4; j++) {
            cubesArray3D[i][j] = [];
            for (let k = 0; k < 4; k++) {
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
                cubeGroup.add(cubelet); // Add to cube group instead of scene
                cubesArray3D[xIndex(x)][yIndex(y)][zIndex(z)] = cubelet;
                cubeletCount++;
                console.log(`Adding cubelet ${cubeletCount} at:`, x, y, z);
            }
        }
    }
    console.log(`Created ${cubeletCount} cubelets in a 4x4x4 configuration`);
}

// Create individual cubelet
function createCubelet(x, y, z) {
    // Use smaller geometry for 4x4 cubelets with proper spacing
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const materials = [];
    
    // Define face colors based on position
    const colors = getCubeletColors(x, y, z);
    
    for (let i = 0; i < 6; i++) {
        materials.push(new THREE.MeshBasicMaterial({ 
            color: colors[i],
            transparent: false,
            opacity: 1.0
        }));
    }
    
    const cubelet = new THREE.Mesh(geometry, materials);
    
    // ✅ Store only original position (exactly like 2x2)
    cubelet.userData = { originalPosition: { x, y, z } };
    
    // Add black edges to make the cube structure more visible
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    cubelet.add(edgeLines);
    
    return cubelet;
}

// Get colors for each face of a cubelet
function getCubeletColors(x, y, z) {
    const colors = new Array(6).fill(COLORS.BLACK);
    
    // Three.js BoxGeometry face order: right, left, top, bottom, front, back
    // Right face (x = 1.5) - RED
    if (x === 1.5) colors[0] = COLORS.RED;
    // Left face (x = -1.5) - ORANGE  
    if (x === -1.5) colors[1] = COLORS.ORANGE;
    // Top face (y = 1.5) - WHITE
    if (y === 1.5) colors[2] = COLORS.WHITE;
    // Bottom face (y = -1.5) - YELLOW
    if (y === -1.5) colors[3] = COLORS.YELLOW;
    // Front face (z = 1.5) - GREEN
    if (z === 1.5) colors[4] = COLORS.GREEN;
    // Back face (z = -1.5) - BLUE
    if (z === -1.5) colors[5] = COLORS.BLUE;
    
    return colors;
}

// Setup mouse drag events for cube rotation
function setupMouseDragEvents() {
    const canvas = renderer.domElement;
    
    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        canvas.style.cursor = 'grabbing';
        console.log('🔍 Mouse drag started');
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        // Rotate the entire cube group
        cubeGroup.rotation.y += deltaX * 0.01;
        cubeGroup.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        console.log('🔍 Mouse drag ended');
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        console.log('🔍 Mouse left canvas');
    });
    
    // Set initial cursor style
    canvas.style.cursor = 'grab';
}

// ✅ Create space particles/stars
function createSpaceParticles() {
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Random positions in a large sphere
        const radius = 20 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Random star colors (white, blue, yellow)
        const starTypes = [0xffffff, 0x4a90e2, 0xffd700];
        const starColor = starTypes[Math.floor(Math.random() * starTypes.length)];
        
        colors[i * 3] = (starColor >> 16) / 255;
        colors[i * 3 + 1] = ((starColor >> 8) & 255) / 255;
        colors[i * 3 + 2] = (starColor & 255) / 255;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Store for animation
    window.spaceParticles = particleSystem;
    console.log('Space particles created');
}

// ✅ Enhanced animate function with space effects
function animate() {
    requestAnimationFrame(animate);
    
    // Animate space particles
    if (window.spaceParticles) {
        window.spaceParticles.rotation.y += 0.0005; // Slow rotation
    }
    
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Helper functions for array indexing
function xIndex(val) { 
    if (val === -1.5) return 0;
    if (val === -0.5) return 1;
    if (val === 0.5) return 2;
    if (val === 1.5) return 3;
    return 0;
}

function yIndex(val) { 
    if (val === -1.5) return 0;
    if (val === -0.5) return 1;
    if (val === 0.5) return 2;
    if (val === 1.5) return 3;
    return 0;
}

function zIndex(val) { 
    if (val === -1.5) return 0;
    if (val === -0.5) return 1;
    if (val === 0.5) return 2;
    if (val === 1.5) return 3;
    return 0;
}

// Update cubelet positions after rotation
function updateCubeletPositionsAfterRotation(rotatedCubelets) {
    console.log('Updating cubelet positions after rotation...');
    
    // Clear the 3D array
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                cubesArray3D[i][j][k] = null;
            }
        }
    }
    
    // Update the array with new positions and ensure materials are preserved
    rotatedCubelets.forEach(cubelet => {
        const pos = cubelet.position;
        const x = xIndex(round(pos.x));
        const y = yIndex(round(pos.y));
        const z = zIndex(round(pos.z));
        
        if (x >= 0 && x < 4 && y >= 0 && y < 4 && z >= 0 && z < 4) {
            cubesArray3D[x][y][z] = cubelet;
            
            // Ensure materials are properly applied
            if (cubelet.material && Array.isArray(cubelet.material)) {
                cubelet.material.forEach((mat, index) => {
                    if (mat && mat.color) {
                        mat.needsUpdate = true;
                    }
                });
            }
        }
    });
    
    console.log('Cubelet positions updated');
}

// Helper function to round numbers
function round(num) {
    return Math.round(num * 100) / 100;
}

// Easing function for smooth animation
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Check if animation is currently running
function isCurrentlyAnimating() {
    return isAnimating || Object.values(face_animation_status).some(status => status);
}

// Debounce key press to prevent rapid repeats
function isKeyPressAllowed() {
    const now = Date.now();
    if (now - lastKeyPressTime < keyDebounceDelay) {
        return false;
    }
    lastKeyPressTime = now;
    return true;
}

// ✅ Reset function that works exactly like 2x2 cube
function resetCubeObject() {
    console.log('🔄 Instantly resetting 4x4 cube to solved state (like 2x2)...');
    
    // Stop auto-solve if it's running
    if (autoSolveMode) {
        stopAutoSolve();
    }
    
    // Reset all cubelets to original positions (exactly like 2x2)
    const positions = [-1.5, -0.5, 0.5, 1.5]; // 4x4 positions
    for (let x of positions) {
        for (let y of positions) {
            for (let z of positions) {
                const cubelet = cubesArray3D[xIndex(x)][yIndex(y)][zIndex(z)];
                if (cubelet) {
                    const originalPos = cubelet.userData.originalPosition;
                    cubelet.position.set(originalPos.x, originalPos.y, originalPos.z);
                    cubelet.rotation.set(0, 0, 0);
                }
            }
        }
    }
    
    // Reset cube group rotation (exactly like 2x2)
    if (cubeGroup) {
        cubeGroup.rotation.set(0, 0, 0);
    }
    
    // Reset move count (exactly like 2x2)
    moveCount = 0;
    updateMoveCounter();
    
    // Clear move history but keep rotation history for analysis (exactly like 2x2)
    moveHistory = [];
    console.log('4x4 cube reset to solved state');
    console.log('🔍 Hidden History: Move history cleared, rotation history preserved');
}

// Export resetCube function to match HTML onclick
export function resetCube() {
    console.log('🔄 Resetting 4x4 cube...');
    resetCubeObject();
}

// 🧪 5. Fix Scramble Function - REPLACE the existing one
function scrambleCube() {
    console.log('🎲 Starting 4x4 cube scramble...');
    
    // Stop auto-solve if it's running
    if (autoSolveMode) {
        stopAutoSolve();
    }
    
    // Clear previous move history
    moveHistory = [];
    console.log('🎲 Cleared previous move history');
    
    // Define all possible moves with notation
    const moves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'", 
                   'r', "r'", 'l', "l'", 'u', "u'", 'd', "d'", 'f', "f'", 'b', "b'"];
    
    console.log('🔍 Hidden History: Starting 4x4 scramble sequence');
    
    // Execute scramble moves sequentially
    function executeScrambleMove(index) {
        if (index >= 20) { // 20 moves for good scramble
            console.log('🎲 4x4 cube scramble completed');
            console.log(` Final move history: ${moveHistory.join(' ')}`);
            return;
        }
        
        const move = moves[Math.floor(Math.random() * moves.length)];
        console.log(`🎲 Scramble move ${index + 1}: ${move}`);
        
        // Execute the move (this will add to moveHistory via rotateFace)
        rotateFace(move);
        
        // Wait for animation to complete before next move
        setTimeout(() => {
            executeScrambleMove(index + 1);
        }, 400);
    }
    
    executeScrambleMove(0);
}

// Update move counter display
function updateMoveCounter() {
    const counter = document.getElementById('move-counter');
    if (counter) {
        counter.textContent = moveCount;
    }
}

// Update mode displays
function updateModeDisplays() {
    const reverseElement = document.getElementById('reverse-mode');
    const autoSolveElement = document.getElementById('auto-solve-mode');
    
    if (reverseElement) {
        reverseElement.textContent = `🔄 Reverse: ${reverseMode ? 'ON' : 'OFF'}`;
    }
    if (autoSolveElement) {
        autoSolveElement.textContent = `🤖 Auto-Solve: ${autoSolveMode ? 'ON' : 'OFF'}`;
    }
}

// ✅ 1. Define getMoveNotation function - ADD THIS
function getMoveNotation(face, direction) {
    const notationMap = {
        'R': 'R', 'L': 'L', 'U': 'U', 'D': 'D', 'F': 'F', 'B': 'B',
        'r': 'Rw', 'l': 'Lw', 'u': 'Uw', 'd': 'Dw', 'f': 'Fw', 'b': 'Bw'
    };
    return direction === 2 ? notationMap[face] + "'" : notationMap[face];
}

// ✅ 2. Fix addToRotationHistory function
function addToRotationHistory(move, direction, source = 'user') {
    const timestamp = Date.now();
    const moveNotation = getMoveNotation(move, direction);
    
    // Add to rotation history (existing functionality)
    rotationHistory.push({
        move: move,
        direction: direction,
        source: source,
        timestamp: timestamp,
        moveCount: moveCount
    });
    
    // Add to move history for auto-solve (new functionality)
    if (source === 'user' || source === 'scramble') {
        moveHistory.push(moveNotation);
        console.log(`📝 Added to move history: ${moveNotation} (source: ${source})`);
    }
    
    // Keep only last 1000 moves to prevent memory issues
    if (rotationHistory.length > 1000) {
        rotationHistory.shift();
    }
    
    if (moveHistory.length > 1000) {
        moveHistory.shift();
    }
}

// Get rotation history
function getRotationHistory() {
    return rotationHistory;
}

// Clear rotation history
function clearRotationHistory() {
    rotationHistory = [];
    console.log('Rotation history cleared');
}

// Get history statistics
function getHistoryStats() {
    const stats = {
        totalMoves: rotationHistory.length,
        userMoves: rotationHistory.filter(m => m.source === 'user').length,
        scrambleMoves: rotationHistory.filter(m => m.source === 'scramble').length,
        solveMoves: rotationHistory.filter(m => m.source === 'solve').length,
        averageMovesPerMinute: 0
    };
    
    if (rotationHistory.length > 1) {
        const timeSpan = rotationHistory[rotationHistory.length - 1].timestamp - rotationHistory[0].timestamp;
        const minutes = timeSpan / (1000 * 60);
        stats.averageMovesPerMinute = Math.round(rotationHistory.length / minutes);
    }
    
    return stats;
}

// Export history data
function exportHistoryData() {
    const data = {
        history: rotationHistory,
        stats: getHistoryStats(),
        timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4x4-cube-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 🔧 1. Setup Global Move History (already exists)
// let moveHistory = []; // Global move history array for auto-solve

// 🔁 2. Create Reverse Function
function invertMove(move) {
    return move.endsWith("'") ? move.slice(0, -1) : move + "'";
}

// 🧠 3. Store Moves in History - Enhanced rotateFace function
function rotateFace(move) {
    console.log(` Executing move: ${move}`);
    
    // Parse move notation to get face and direction
    let face, direction;
    if (move.endsWith("'")) {
        face = move.slice(0, -1);
        direction = 2; // Reverse
    } else {
        face = move;
        direction = 1; // Normal
    }
    
    // Perform the rotation using existing function
    executeMove(face, direction, 'user');
    
    // Add to move history
    moveHistory.push(move);
    console.log(`📝 Added to move history: ${move}`);
    console.log(`📊 Current move history: ${moveHistory.join(' ')}`);
}

// 🎯 4. Implement Auto-Solve - Fixed syntax error
export async function autoSolve() {
    console.log('🤖 Auto-solving 4x4 cube...');
    
    if (moveHistory.length === 0) {
        console.log('🤖 No moves to reverse - cube is already solved');
        return;
    }
    
    // Check if already solving
    if (autoSolveMode) {
        console.log(' Auto-solve already in progress, stopping...');
        autoSolveMode = false;
        return;
    }
    
    // Start auto-solve process
    autoSolveMode = true;
    console.log('🤖 Auto-solve mode enabled - starting solve sequence');
    
    // Disable controls during solving
    disableControls();
    
    // Create reversed moves
    const reversedMoves = moveHistory.slice().reverse().map(invertMove);
    
    console.log(` Auto-solve: Reversing ${reversedMoves.length} moves`);
    console.log('🤖 Original moves:', moveHistory.join(' '));
    console.log('🤖 Reversed moves:', reversedMoves.join(' '));
    
    // Execute reversed moves with animation delay
    for (let i = 0; i < reversedMoves.length; i++) {
        const move = reversedMoves[i];
        
        if (!autoSolveMode) {
            console.log('🤖 Auto-solve cancelled');
            break;
        }
        
        console.log(`🤖 Auto-solve: Move ${i + 1}/${reversedMoves.length} - ${move}`);
        
        // Execute the move
        rotateFace(move);
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Clear move history after solve
    moveHistory = [];
    console.log('🤖 Auto-solve completed - move history cleared');
    
    // Re-enable controls
    enableControls();
    autoSolveMode = false;
}

// Control functions for auto-solve
function disableControls() {
    console.log('🔒 Controls disabled during auto-solve');
    // You can add specific control disabling logic here
}

function enableControls() {
    console.log('🔓 Controls re-enabled after auto-solve');
    // You can add specific control enabling logic here
}

// Enhanced executeMove to work with new system
export function executeMove(move, direction, source = 'user') {
    console.log(`Executing move: ${move} direction: ${direction} source: ${source}`);
    
    // Check animation lock for user moves
    if (source === 'user' && isCurrentlyAnimating()) {
        console.log(`Animation in progress, ignoring move: ${move}`);
        return;
    }
    
    // Check key debouncing for user moves
    if (source === 'user' && !isKeyPressAllowed()) {
        console.log(`Key press debounced, ignoring move: ${move}`);
        return;
    }
    
    if (face_animation_status[move]) {
        console.log(`Move ${move} already in progress, skipping...`);
        return;
    }
    
    // Execute the move first
    rotate4x4Face(move, direction);
    
    // Add to history after move is applied correctly
    addToRotationHistory(move, direction, source);
    
    // Update move count for user moves
    if (source === 'user') {
        moveCount++;
        updateMoveCounter();
    }
}

// EPS to handle float precision
const EPS = 0.01;

// Rotation mapping for 4x4 cube faces with axis, coordinate value, and direction
const rotationMap4x4 = {
    // Outer faces
    U: { axis: 'y', value: 1.5, dir: -1 },
    D: { axis: 'y', value: -1.5, dir: 1 },
    L: { axis: 'x', value: -1.5, dir: -1 },
    R: { axis: 'x', value: 1.5, dir: 1 },
    F: { axis: 'z', value: 1.5, dir: -1 },
    B: { axis: 'z', value: -1.5, dir: 1 },
    // Inner faces
    u: { axis: 'y', value: 0.5, dir: -1 },
    d: { axis: 'y', value: -0.5, dir: 1 },
    l: { axis: 'x', value: -0.5, dir: -1 },
    r: { axis: 'x', value: 0.5, dir: 1 },
    f: { axis: 'z', value: 0.5, dir: -1 },
    b: { axis: 'z', value: -0.5, dir: 1 },
};

// Get all cubelets from the cube group
function getAllCubelets() {
    const allCubelets = [];
    cubeGroup.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.type === 'BoxGeometry') {
            allCubelets.push(child);
        }
    });
    return allCubelets;
}

// Select cubelets for a specific face using coordinate checks (adapted from 2x2)
function getFaceCubelets(face) {
    const { axis, value } = rotationMap4x4[face];
    const allCubelets = getAllCubelets();
    return allCubelets.filter(c => Math.abs(c.position[axis] - value) < EPS);
}

// Simple and reliable face rotation that behaves exactly like a real Rubik's Cube (adapted from 2x2)
export function rotate4x4Face(face, direction) {
    console.log(`🔍 DEBUG: rotate4x4Face called with face: ${face}, direction: ${direction}`);
    
    // Check if face is already animating
    if (face_animation_status[face]) {
        console.log(` DEBUG: Face ${face} is already animating, skipping`);
        return;
    }
    
    // Set animation status for the face
    face_animation_status[face] = true;
    
    // Get cubelets for this face
    const selected = getFaceCubelets(face);
    
    console.log(`🔍 DEBUG: Face: ${face}, Cubelets found: ${selected.length}`);
    
    if (selected.length === 0) {
        console.error(` ERROR: No cubelets found for face ${face}`);
        face_animation_status[face] = false;
        return;
    }
    
    // Get rotation configuration
    const { axis, dir } = rotationMap4x4[face];
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
    const duration = 350; // Slightly faster than 2x2 for 4x4
    const startTime = Date.now();
    
    function animateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation (same as 2x2)
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

// Toggle reverse mode
export function toggleReverse() {
    reverseMode = !reverseMode;
    console.log(`Reverse mode: ${reverseMode ? 'ON' : 'OFF'}`);
}

// Fixed resetCameraView function - adapted from 2x2
function resetCameraView() {
    console.log('📷 Resetting 4x4 camera view...');
    if (camera && controls) {
        camera.position.set(4, 4, 4); // Adjusted for 4x4 size
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        console.log('📷 Camera view reset to default position');
    }
    
    // Reset cube group rotation
    if (cubeGroup) {
        cubeGroup.rotation.set(0, 0, 0);
        console.log('📷 Cube group rotation reset');
    }
}

// Fixed resetCubeRotation function - adapted from 2x2
function resetCubeRotation() {
    console.log('🔄 Resetting 4x4 cube rotation...');
    if (cubeGroup) {
        cubeGroup.rotation.set(0, 0, 0);
        console.log('🔄 Cube rotation reset to default');
    }
}

// Solve cube using LBL method (placeholder for 4x4)
function solveCubeLBL() {
    console.log('🧠 Solving 4x4 cube using LBL method...');
    
    // For 4x4, we would need a more complex algorithm
    // This is a placeholder that just resets the cube
    const steps = [
        { move: 'R', direction: 1, delay: 500 },
        { move: 'U', direction: 1, delay: 1000 },
        { move: 'F', direction: 1, delay: 1500 }
    ];
    
    let stepIndex = 0;
    
    function executeNextStep() {
        if (stepIndex >= steps.length) {
            console.log('LBL solve complete');
            return;
        }
        
        const step = steps[stepIndex];
        setTimeout(() => {
            executeMove(step.move, step.direction, 'solve');
            stepIndex++;
            executeNextStep();
        }, step.delay);
    }
    
    executeNextStep();
}

// Fixed stopAutoSolve function - adapted from 2x2
function stopAutoSolve() {
    autoSolveMode = false;
    console.log('🤖 Auto-solve stopped');
}

// Fallback key handler function
function handleKeyPress(event) {
    console.log('Key pressed:', event.key);
    
    // Check if animation is in progress
    if (isCurrentlyAnimating()) {
        console.log('Animation in progress, ignoring key press');
        return;
    }
    
    // Check key debouncing
    if (!isKeyPressAllowed()) {
        console.log('Key press debounced');
        return;
    }
    
    let move = null;
    let direction = 1; // Default direction
    
    // Handle outer face moves
    switch (event.key) {
        case 'r':
        case 'R':
            move = 'R';
            break;
        case 'l':
        case 'L':
            move = 'L';
            break;
        case 'u':
        case 'U':
            move = 'U';
            break;
        case 'd':
        case 'D':
            move = 'D';
            break;
        case 'f':
        case 'F':
            move = 'F';
            break;
        case 'b':
        case 'B':
            move = 'B';
            break;
    }
    
    // Handle inner face moves (with Shift key)
    if (event.shiftKey) {
        switch (event.key) {
            case 'r':
            case 'R':
                move = 'r';
                break;
            case 'l':
            case 'L':
                move = 'l';
                break;
            case 'u':
            case 'U':
                move = 'u';
                break;
            case 'd':
            case 'D':
                move = 'd';
                break;
            case 'f':
            case 'F':
                move = 'f';
                break;
            case 'b':
            case 'B':
                move = 'b';
                break;
        }
    }
    
    // Handle direction (1 or 2 key)
    if (event.key === '1') {
        direction = 1;
    } else if (event.key === '2') {
        direction = 2;
    }
    
    // Execute the move if valid
    if (move) {
        console.log(`Executing move: ${move}${direction}`);
        executeMove(move, direction, 'user');
    }
}

// Initialize everything when the page loads - Fixed with error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing 4x4 cube...');
    
    try {
        initScene();
        animate();
        console.log('4x4 cube initialization successful');
    } catch (error) {
        console.error('Failed to initialize 4x4 cube:', error);
        // Show error message to user
        const container = document.getElementById('cube-container');
        if (container) {
            container.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error loading 4x4 cube. Please refresh the page.</div>';
        }
    }
});

// Export functions for global access
window.scrambleCube = scrambleCube;
window.resetCube = resetCube;
window.autoSolve = autoSolve;
window.toggleReverse = toggleReverse;
window.resetCameraView = resetCameraView;
window.resetCubeRotation = resetCubeRotation;
window.isCurrentlyAnimating = isCurrentlyAnimating; 