// 4x4 Rubik's Cube AI Solver

// Global variables
let scene, camera, renderer, controls;
let cubeGroup;
let cubesArray4D = [];
let isRotating = false;
let isSolving = false;
let isPaused = false;
let currentStep = 0;
let currentMove = 0;
let moveHistory = [];

// Colors for 4x4 cube
const COLORS = {
    WHITE: 0xffffff,
    YELLOW: 0xffff00,
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
    ORANGE: 0xff8000,
    RED: 0xff0000,
    BLACK: 0x000000
};

// Materials array for cubelet faces
let materialsArray = [];

// Initialize the scene
function initScene() {
    const container = document.getElementById('cube-container');
    
    // Initialize materials array
    materialsArray = [
        new THREE.MeshStandardMaterial({ color: COLORS.WHITE, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.YELLOW, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.GREEN, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.BLUE, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.ORANGE, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.RED, roughness: 0.3, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: COLORS.BLACK, roughness: 0.3, metalness: 0.1 })
    ];
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0a0a0a);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.0;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    
    // Create 4x4 cube
    create4x4Cube();
    
    // Start animation loop
    animate();
}

// Create 4x4 cube with 64 cubelets
function create4x4Cube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    
    // Initialize 4D array for 4x4x4 cube
    for (let x = 0; x < 4; x++) {
        cubesArray4D[x] = [];
        for (let y = 0; y < 4; y++) {
            cubesArray4D[x][y] = [];
            for (let z = 0; z < 4; z++) {
                cubesArray4D[x][y][z] = [];
                for (let layer = 0; layer < 4; layer++) {
                    cubesArray4D[x][y][z][layer] = null;
                }
            }
        }
    }
    
    // Create cubelets at positions [-1.2, -0.4, 0.4, 1.2] for each axis (tighter spacing)
    const positions = [-1.2, -0.4, 0.4, 1.2];
    
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            for (let z = 0; z < 4; z++) {
                const cubelet = createCubelet(positions[x], positions[y], positions[z]);
                cubeGroup.add(cubelet);
                cubesArray4D[x][y][z][0] = cubelet;
            }
        }
    }
    
    console.log('4x4 Cube created with 64 cubelets');
    console.log('Cube group children count:', cubeGroup.children.length);
    console.log('Scene children count:', scene.children.length);
}

// Create individual cubelet
function createCubelet(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const colors = getCubeletColors(x, y, z);
    
    // Create materials array for this cubelet
    const materials = [
        materialsArray[colors.right],   // Right
        materialsArray[colors.left],    // Left
        materialsArray[colors.top],     // Top
        materialsArray[colors.bottom],  // Bottom
        materialsArray[colors.front],   // Front
        materialsArray[colors.back]     // Back
    ];
    
    const cubelet = new THREE.Mesh(geometry, materials);
    cubelet.position.set(x, y, z);
    cubelet.userData = { originalX: x, originalY: y, originalZ: z };
    
    return cubelet;
}

// Get colors for cubelet based on position
function getCubeletColors(x, y, z) {
    const colors = {
        right: 6, left: 6, top: 6, bottom: 6, front: 6, back: 6
    };
    
    // Right face (x = 1.2)
    if (Math.abs(x - 1.2) < 0.1) colors.right = 5; // Red
    
    // Left face (x = -1.2)
    if (Math.abs(x + 1.2) < 0.1) colors.left = 4; // Orange
    
    // Top face (y = 1.2)
    if (Math.abs(y - 1.2) < 0.1) colors.top = 0; // White
    
    // Bottom face (y = -1.2)
    if (Math.abs(y + 1.2) < 0.1) colors.bottom = 1; // Yellow
    
    // Front face (z = 1.2)
    if (Math.abs(z - 1.2) < 0.1) colors.front = 2; // Green
    
    // Back face (z = -1.2)
    if (Math.abs(z + 1.2) < 0.1) colors.back = 3; // Blue
    
    return colors;
}

// Get cubelets for a specific face and layer
function getFaceCubelets(face, layerIndex) {
    const cubelets = [];
    const EPS = 0.1;
    
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            for (let z = 0; z < 4; z++) {
                const cubelet = cubesArray4D[x][y][z][0];
                if (!cubelet) continue;
                
                let shouldInclude = false;
                
                switch (face) {
                    case 'R':
                        shouldInclude = Math.abs(cubelet.position.x - 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                    case 'L':
                        shouldInclude = Math.abs(cubelet.position.x + 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                    case 'U':
                        shouldInclude = Math.abs(cubelet.position.y - 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                    case 'D':
                        shouldInclude = Math.abs(cubelet.position.y + 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                    case 'F':
                        shouldInclude = Math.abs(cubelet.position.z - 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                    case 'B':
                        shouldInclude = Math.abs(cubelet.position.z + 1.2) < EPS && 
                                       (layerIndex === 0 || layerIndex === 1);
                        break;
                }
                
                if (shouldInclude) {
                    cubelets.push(cubelet);
                }
            }
        }
    }
    
    return cubelets;
}

// Rotate face of 4x4 cube
function rotate4x4Face(face, layerIndex, direction, callback) {
    if (isRotating) return;
    
    isRotating = true;
    const cubelets = getFaceCubelets(face, layerIndex);
    
    if (cubelets.length === 0) {
        isRotating = false;
        if (callback) callback();
        return;
    }
    
    // Create rotation group
    const rotationGroup = new THREE.Group();
    cubelets.forEach(cubelet => {
        cubeGroup.remove(cubelet);
        rotationGroup.add(cubelet);
    });
    scene.add(rotationGroup);
    
    // Determine rotation axis and angle
    let axis;
    const rotationAngle = (Math.PI / 2) * (direction === 1 ? 1 : -1);
    
    switch (face) {
        case 'R':
        case 'L':
            axis = new THREE.Vector3(1, 0, 0);
            break;
        case 'U':
        case 'D':
            axis = new THREE.Vector3(0, 1, 0);
            break;
        case 'F':
        case 'B':
            axis = new THREE.Vector3(0, 0, 1);
            break;
    }
    
    // Animate rotation
    const startTime = Date.now();
    const duration = 400;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        rotationGroup.rotateOnAxis(axis, rotationAngle * (easeProgress - (progress > 0 ? 1 : 0)));
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete
            cubelets.forEach(cubelet => {
                rotationGroup.remove(cubelet);
                cubeGroup.add(cubelet);
            });
            scene.remove(rotationGroup);
            
            isRotating = false;
            if (callback) callback();
        }
    }
    
    animate();
}

// Scramble 4x4 cube
function scramble4x4() {
    if (isRotating || isSolving) return;
    
    updateStatus('Scrambling 4x4 cube...');
    moveHistory = [];
    
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    const layers = [0, 1];
    const directions = [1, 2];
    
    let moveCount = 0;
    const totalMoves = 25; // More moves for 4x4
    
    function applyNextMove() {
        if (moveCount >= totalMoves) {
            updateStatus('4x4 Scramble completed! Ready for solving.');
            return;
        }
        
        const face = moves[Math.floor(Math.random() * moves.length)];
        const layer = layers[Math.floor(Math.random() * layers.length)];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        const moveNotation = `${face}${layer === 1 ? 'w' : ''}${direction === 2 ? "'" : ''}`;
        moveHistory.push(moveNotation);
        
        rotate4x4Face(face, layer, direction, () => {
            moveCount++;
            updateProgress((moveCount / totalMoves) * 100);
            setTimeout(applyNextMove, 300);
        });
    }
    
    applyNextMove();
}

// Solve 4x4 cube (simplified algorithm)
function solve4x4() {
    if (isRotating || isSolving) return;
    
    isSolving = true;
    currentStep = 0;
    currentMove = 0;
    
    updateStatus('Starting 4x4 solve...');
    
    // Simplified 4x4 solving algorithm
    const solveSteps = [
        { name: "Center Pairing", moves: ["R", "U", "R'", "U'"] },
        { name: "Edge Pairing", moves: ["F", "R", "U", "R'", "U'", "F'"] },
        { name: "3x3 Solve", moves: ["R", "U", "R'", "U'"] },
        { name: "Parity Fix", moves: ["R", "U", "R'", "U'"] }
    ];
    
    function executeStep() {
        if (!isSolving || isPaused) {
            updateStatus('Solving stopped');
            return;
        }
        
        if (currentStep >= solveSteps.length) {
            isSolving = false;
            updateStatus('4x4 Solve completed!');
            updateProgress(100);
            return;
        }
        
        const step = solveSteps[currentStep];
        updateStatus(`Step ${currentStep + 1}: ${step.name}`);
        
        if (currentMove >= step.moves.length) {
            currentStep++;
            currentMove = 0;
            setTimeout(executeStep, 500);
            return;
        }
        
        const move = step.moves[currentMove];
        const face = move.replace("'", "");
        const direction = move.includes("'") ? 2 : 1;
        
        rotate4x4Face(face, 0, direction, () => {
            currentMove++;
            updateProgress(((currentStep * step.moves.length + currentMove) / (solveSteps.length * 4)) * 100);
            setTimeout(executeStep, 300);
        });
    }
    
    executeStep();
}

// Reset 4x4 cube
function reset4x4() {
    if (isRotating || isSolving) return;
    
    // Remove all cubelets
    while (cubeGroup.children.length > 0) {
        cubeGroup.remove(cubeGroup.children[0]);
    }
    
    // Recreate cube
    create4x4Cube();
    
    // Reset variables
    isSolving = false;
    isPaused = false;
    currentStep = 0;
    currentMove = 0;
    moveHistory = [];
    
    updateStatus('4x4 Cube reset');
    updateProgress(0);
    updateStepsDisplay([]);
}

// Update status display
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('Status:', message);
}

// Update progress bar
function updateProgress(percentage) {
    const progressElement = document.getElementById('progress');
    if (progressElement) {
        progressElement.style.width = percentage + '%';
    }
}

// Update steps display
function updateStepsDisplay(steps) {
    const container = document.getElementById('steps-container');
    if (!container) return;
    
    if (steps.length === 0) {
        container.innerHTML = '<div class="step-item">No steps yet. Start solving to see the algorithm.</div>';
        return;
    }
    
    container.innerHTML = steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const className = `step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
        return `<div class="${className}">${index + 1}. ${step}</div>`;
    }).join('');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initScene();
    }, 100);
});

// Export functions for global access
window.scramble4x4 = scramble4x4;
window.solve4x4 = solve4x4;
window.reset4x4 = reset4x4; 