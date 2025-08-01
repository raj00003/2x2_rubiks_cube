// Animation management for 2x2 Rubik's Cube
let activeAnimations = [];
let animationQueue = [];

function initAnimations() {
    // Initialize animation system
    console.log('Animation system initialized for 2x2 cube');
}

// Add animation to queue
function queueAnimation(animation) {
    animationQueue.push(animation);
    processAnimationQueue();
}

// Process animation queue
function processAnimationQueue() {
    if (activeAnimations.length === 0 && animationQueue.length > 0) {
        const nextAnimation = animationQueue.shift();
        activeAnimations.push(nextAnimation);
        
        nextAnimation.start();
    }
}

// Remove completed animation
function removeAnimation(animation) {
    const index = activeAnimations.indexOf(animation);
    if (index > -1) {
        activeAnimations.splice(index, 1);
        processAnimationQueue();
    }
}

// Check if any animations are running
function isAnimating() {
    return activeAnimations.length > 0;
}

// Stop all animations
function stopAllAnimations() {
    activeAnimations.forEach(animation => animation.stop());
    activeAnimations = [];
    animationQueue = [];
}

// Create keyframe animation for face rotation
function createFaceRotationKeyframes(face, direction, duration = 300) {
    const keyframes = [];
    const steps = 30; // Number of keyframes
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const angle = (direction === 1 ? Math.PI / 2 : -Math.PI / 2) * progress;
        
        keyframes.push({
            time: progress * duration,
            angle: angle,
            progress: progress
        });
    }
    
    return keyframes;
}

// Animate face rotation with keyframes
function animateFaceRotation(objects, axis, angle, onComplete = null) {
    const keyframes = createFaceRotationKeyframes(axis, angle > 0 ? 1 : 2);
    const animation = new KeyframeAnimation(objects, keyframes, axis, onComplete);
    
    queueAnimation(animation);
    return animation;
}

// Keyframe Animation Class
class KeyframeAnimation {
    constructor(objects, keyframes, axis, onComplete = null) {
        this.objects = Array.isArray(objects) ? objects : [objects];
        this.keyframes = keyframes;
        this.axis = axis;
        this.onComplete = onComplete;
        this.currentFrame = 0;
        this.startTime = Date.now();
        this.isComplete = false;
    }
    
    start() {
        this.animate();
    }
    
    animate() {
        if (this.isComplete) return;
        
        const elapsed = Date.now() - this.startTime;
        const currentKeyframe = this.keyframes.find(kf => kf.time >= elapsed);
        
        if (currentKeyframe) {
            // Apply current keyframe
            this.objects.forEach(obj => {
                switch (this.axis) {
                    case 'x':
                        obj.rotation.x = currentKeyframe.angle;
                        break;
                    case 'y':
                        obj.rotation.y = currentKeyframe.angle;
                        break;
                    case 'z':
                        obj.rotation.z = currentKeyframe.angle;
                        break;
                }
            });
        }
        
        if (elapsed < this.keyframes[this.keyframes.length - 1].time) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.isComplete = true;
        
        // Ensure final angle is set exactly
        const finalKeyframe = this.keyframes[this.keyframes.length - 1];
        this.objects.forEach(obj => {
            switch (this.axis) {
                case 'x':
                    obj.rotation.x = finalKeyframe.angle;
                    break;
                case 'y':
                    obj.rotation.y = finalKeyframe.angle;
                    break;
                case 'z':
                    obj.rotation.z = finalKeyframe.angle;
                    break;
            }
        });
        
        removeAnimation(this);
        
        if (this.onComplete) {
            this.onComplete();
        }
    }
    
    stop() {
        this.isComplete = true;
        removeAnimation(this);
    }
}

// Export functions
export { 
    initAnimations, 
    queueAnimation, 
    isAnimating, 
    stopAllAnimations,
    createFaceRotationKeyframes,
    animateFaceRotation
}; 