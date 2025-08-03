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

// Mouse drag variables for cube rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cubeGroup; // Master group containing all cubelets

// ✅ Enhanced Cube colors - Darker and brighter for better visibility against space background
const COLORS = {
    WHITE: 0xFFFFFF,      // Pure white - already bright
    YELLOW: 0xFFD700,     // Golden yellow - brighter than 0xFFFF00
    RED: 0xDC143C,        // Crimson red - darker and more vibrant
    ORANGE: 0xFF4500,     // Orange red - brighter and more vibrant
    BLUE: 0x0066CC,       // Deep blue - darker and more visible
    GREEN: 0x32CD32,      // Lime green - brighter and more vibrant
    BLACK: 0x000000       // Pure black - unchanged
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
    
    // ✅ Create space-like background for 2x2
    // Deep space gradient background
    const spaceGradient = new THREE.Color(0x0a0e27); // Deep space blue
    scene.background = spaceGradient;
    console.log('Scene created with space background');
    
    // Camera setup - positioned properly for 2x2 cube
    const container = document.getElementById('cube-container');
    if (!container) {
        console.error('Cube container not found!');
        return;
    }
    console.log('Container found:', container);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2.5, 2.5, 2.5); // Closer position for bigger cube appearance
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
        controls.minDistance = 2; // allow getting closer for bigger view
        controls.maxDistance = 8; // limit maximum distance
        controls.autoRotate = false; // no auto-rotation
        controls.enableKeys = false; // disable keyboard controls
        controls.target.set(0, 0, 0); // ensure target is at cube center
        
        console.log('OrbitControls created with enhanced settings');
    } else {
        console.warn('OrbitControls not available');
        controls = null;
    }
    
    // ✅ Enhanced space lighting for better color visibility
    // Ambient light for overall space illumination - increased intensity
    const ambientLight = new THREE.AmbientLight(0x2d3a5f, 0.6); // Brighter blue ambient
    scene.add(ambientLight);
    
    // Main directional light (like a distant star) - increased intensity
    const directionalLight = new THREE.DirectionalLight(0x60a5fa, 1.0); // Brighter blue-white star light
    directionalLight.position.set(3, 3, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Secondary directional light for depth - increased intensity
    const directionalLight2 = new THREE.DirectionalLight(0x4a90e2, 0.5); // Brighter deep blue secondary
    directionalLight2.position.set(-2, -2, -2);
    scene.add(directionalLight2);
    
    // ✅ Additional fill light for better color visibility
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3); // White fill light
    fillLight.position.set(0, 5, 0);
    scene.add(fillLight);
    
    console.log('Enhanced space lighting added for better color visibility');
    
    // ✅ Add space particles/stars for 2x2
    createSpaceParticles();
    
    // Create the master cube group
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    console.log('Cube group created');
    
    // Create the 2x2 cube
    createCube();
    console.log('Cube created');
    
    // Setup mouse drag events for cube rotation
    setupMouseDragEvents();
    console.log('Mouse drag events setup complete');
    
    // Debug: Log scene children to verify cubelets are added
    console.log('Scene children count:', scene.children.length);
    console.log('Scene children:', scene.children);
    
    // Initialize modules
    initKeyHandler();
    initAnimations();
    
    // Start render loop
    animate();
    console.log('Animation loop started with enhanced space theme');
}

// Create 2x2 cube (8 cubelets)
function createCube() {
    console.log('Creating 2x2 cube...');
    // Use minimal spacing for tight 2x2 block
    const pos = [-0.6, 0.6];
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
                cubeGroup.add(cubelet); // Add to cube group instead of scene
                cubesArray3D[xIndex(x)][yIndex(y)][zIndex(z)] = cubelet;
                cubeletCount++;
                console.log(`Adding cubelet ${cubeletCount} at:`, x, y, z);
            }
        }
    }
    console.log(`Created ${cubeletCount} cubelets in a tight 2x2 configuration`);
}

// Create individual cubelet
function createCubelet(x, y, z) {
    // Use smaller geometry for tighter cubelets
    const geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
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
    // Right face (x = 0.6) - RED
    if (x === 0.6) colors[0] = COLORS.RED;
    // Left face (x = -0.6) - ORANGE  
    if (x === -0.6) colors[1] = COLORS.ORANGE;
    // Top face (y = 0.6) - WHITE
    if (y === 0.6) colors[2] = COLORS.WHITE;
    // Bottom face (y = -0.6) - YELLOW
    if (y === -0.6) colors[3] = COLORS.YELLOW;
    // Front face (z = 0.6) - GREEN
    if (z === 0.6) colors[4] = COLORS.GREEN;
    // Back face (z = -0.6) - BLUE
    if (z === -0.6) colors[5] = COLORS.BLUE;
    
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

// ✅ Create space particles/stars for 2x2
function createSpaceParticles() {
    const particleCount = 300; // Fewer particles for 2x2 (smaller scene)
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Random positions in a smaller sphere (appropriate for 2x2)
        const radius = 10 + Math.random() * 20;
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
        size: 0.08, // Slightly smaller particles for 2x2
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Store for animation
    window.spaceParticles = particleSystem;
    console.log('Space particles created for 2x2');
}

// ✅ Enhanced animate function with space effects for 2x2
function animate() {
    requestAnimationFrame(animate);
    
    // Animate space particles
    if (window.spaceParticles) {
        window.spaceParticles.rotation.y += 0.0003; // Slower rotation for 2x2
    }
    
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
    
    // Debug: Log render status every 5 seconds
    if (Math.random() < 0.001) {
        console.log('Rendering scene with', scene.children.length, 'objects');
        console.log('🔍 Controls active:', !!controls);
        console.log('🔍 Camera position:', camera.position);
        console.log('🔍 Cube group rotation:', cubeGroup?.rotation);
    }
}

// Position mapping helper functions
function xIndex(val) { return val === -0.6 ? 0 : 1; }
function yIndex(val) { return val === -0.6 ? 0 : 1; }
function zIndex(val) { return val === -0.6 ? 0 : 1; }

// Function to update cubelet positions in the 3D array after rotation
function updateCubeletPositionsAfterRotation(rotatedCubelets) {
    // Get all cubelets from the cube group
    const allCubelets = [];
    cubeGroup.traverse((child) => {
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
    const pos = [-0.6, 0.6];
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
    
    // Reset cube group rotation
    cubeGroup.rotation.set(0, 0, 0);
    
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
    const moveCounterElement = document.getElementById('move-counter');
    if (moveCounterElement) {
        moveCounterElement.textContent = moveCount;
    }
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
    
    // Add to rotation history (except for auto-solve moves to avoid double counting)
    if (source !== 'auto-solve') {
        addToRotationHistory(move, direction, source);
    }
    
    // Increment move count for user moves only
    if (source === 'user') {
        moveCount++;
        updateMoveCounter();
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
}

// EPS to handle float precision
const EPS = 0.01;

// Rotation mapping for each face with axis, coordinate value, and direction
const rotationMap = {
    U: { axis: 'y', value: 0.6, dir: -1 },
    D: { axis: 'y', value: -0.6, dir: 1 },
    L: { axis: 'x', value: -0.6, dir: -1 },
    R: { axis: 'x', value: 0.6, dir: 1 },
    F: { axis: 'z', value: 0.6, dir: -1 },
    B: { axis: 'z', value: -0.6, dir: 1 },
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
    console.log(`Reverse mode: ${reverseMode ? 'ON' : 'OFF'}`);
}

// Completely remove the problematic updateModeDisplays function
// Replace with a safe version that does nothing
function updateModeDisplays() {
    // Safe function that does nothing - prevents all errors
    return;
}

// Fixed Auto-Solve Function - Uses rotation history to solve the cube
export function autoSolve() {
    console.log('🔍 Auto-solve function called');
    
    // Check if already solving
    if (autoSolveMode) {
        console.log('🔍 Auto-solve already in progress, stopping...');
        autoSolveMode = false;
        return;
    }
    
    // Start auto-solve process
    autoSolveMode = true;
    console.log('🔍 Auto-solve mode enabled - starting solve sequence');
    
    // Get the current rotation history to reverse (this is what stores all moves)
    const currentHistory = [...rotationHistory];
    
    if (currentHistory.length === 0) {
        console.log('🔍 No moves to reverse - cube is already solved');
        autoSolveMode = false;
        return;
    }
    
    // Reverse the history (last move first)
    const reversedMoves = currentHistory.reverse();
    
    console.log(`🔍 Auto-solve: Reversing ${reversedMoves.length} moves`);
    console.log('🔍 Reversed moves:', reversedMoves.map(m => `${m.move}${m.direction}`).join(', '));
    
    // Execute reversed moves with delay
    reversedMoves.forEach((moveEntry, index) => {
        const delay = index * 800; // 800ms between moves for better visibility
        
        setTimeout(() => {
            if (!autoSolveMode) {
                console.log('🔍 Auto-solve cancelled');
                return;
            }
            
            // Reverse the direction (1 becomes 2, 2 becomes 1)
            const reversedDirection = moveEntry.direction === 1 ? 2 : 1;
            
            console.log(`🔍 Auto-solve: Move ${index + 1}/${reversedMoves.length} - ${moveEntry.move}${reversedDirection} (reversing ${moveEntry.move}${moveEntry.direction})`);
            
            // Execute the move directly without adding to history
            executeMove(moveEntry.move, reversedDirection, 'auto-solve');
            
            // Check if this is the last move
            if (index === reversedMoves.length - 1) {
                setTimeout(() => {
                    autoSolveMode = false;
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

// Camera reset function
function resetCameraView() {
    if (camera && controls) {
        camera.position.set(2.5, 2.5, 2.5);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        console.log('🔍 Camera view reset to default position');
    }
    
    // Reset cube group rotation
    if (cubeGroup) {
        cubeGroup.rotation.set(0, 0, 0);
        console.log('🔍 Cube group rotation reset');
    }
}

window.resetCameraView = resetCameraView;

// Reset cube rotation function
function resetCubeRotation() {
    if (cubeGroup) {
        cubeGroup.rotation.set(0, 0, 0);
        console.log('🔍 Cube rotation reset to default');
    }
}

window.resetCubeRotation = resetCubeRotation;

// Auto-solve control function - No mode display references
function stopAutoSolve() {
    if (autoSolveMode) {
        autoSolveMode = false;
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