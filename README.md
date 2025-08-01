# 2x2 Rubik's Cube

A 3D web-based 2x2 Rubik's Cube simulator built with Three.js, featuring smooth animations and intuitive controls.

## Features

- **2x2 Cube Rendering**: Displays a 3D 2x2 Rubik's Cube with proper colors
- **Smooth Animations**: Fluid face rotation animations with easing
- **Keyboard Controls**: Intuitive keyboard shortcuts for cube manipulation
- **Mouse Controls**: Orbit controls for viewing the cube from any angle
- **Move Counter**: Tracks the number of moves made
- **Scramble Function**: Randomly scrambles the cube
- **Reset Function**: Returns the cube to solved state
- **Reverse Mode**: Toggle between normal and reverse rotation directions
- **Undo Function**: Undo the last move with Ctrl+Z

## Controls

### Face Rotations
- **R** - Rotate Right face
- **L** - Rotate Left face  
- **U** - Rotate Up face
- **D** - Rotate Down face
- **F** - Rotate Front face
- **B** - Rotate Back face

### Direction Control
- **1** - Normal direction (clockwise)
- **2** - Reverse direction (counter-clockwise)
- **T** - Toggle reverse mode

### Other Controls
- **Ctrl+Z** - Undo last move
- **Mouse** - Drag to rotate camera view
- **Mouse Wheel** - Zoom in/out

## Technical Details

### Architecture
- **rubik.js** - Main cube logic, scene setup, and face rotation functions
- **keyHandler.js** - Keyboard event handling and input processing
- **motion.js** - Animation system for smooth rotations
- **animations.js** - Keyframe animation management

### 2x2 Implementation
- Uses only 8 cubelets (2×2×2) instead of 27
- Coordinates limited to -1.1 and +1.1 for all axes
- Simplified face rotation logic for 2x2 structure
- No middle layer moves (M, E, S keys disabled)

### Technologies Used
- **Three.js** - 3D rendering and scene management
- **ES6 Modules** - Modern JavaScript module system
- **Bootstrap** - UI styling and responsive design
- **OrbitControls** - Camera manipulation

## Setup

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. The cube will automatically load and be ready to use

## Browser Compatibility

Requires a modern browser with support for:
- ES6 modules
- WebGL
- Three.js

## File Structure

```
rubicgame2x2/
├── index.html          # Main HTML file
├── js/
│   ├── rubik.js        # Main cube logic
│   ├── keyHandler.js   # Keyboard input handling
│   ├── motion.js       # Animation system
│   └── animations.js   # Keyframe animations
└── README.md           # This file
```

## Development

The system is modular and can be easily extended:
- Add new animation types in `motion.js`
- Implement additional controls in `keyHandler.js`
- Modify cube appearance in `rubik.js`
- Add new UI features in `index.html` 