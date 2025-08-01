export class Motion {
    constructor(objects, axis, angle, onComplete = null) {
        this.objects = Array.isArray(objects) ? objects : [objects];
        this.axis = axis;
        this.angle = angle;
        this.onComplete = onComplete;
        this.duration = 600; // 0.6 seconds for realistic cube rotation
        this.startTime = Date.now();
        this.isComplete = false;
        
        // Store initial rotations for incremental animation
        this.initialRotations = this.objects.map(obj => {
            switch (this.axis) {
                case 'x': return obj.rotation.x;
                case 'y': return obj.rotation.y;
                case 'z': return obj.rotation.z;
            }
        });
        
        this.start();
    }
    
    start() {
        this.animate();
    }
    
    animate() {
        if (this.isComplete) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Easing function for smooth animation
        const easedProgress = this.easeInOutCubic(progress);
        const currentAngle = this.angle * easedProgress;
        
        // Apply incremental rotation to all objects
        this.objects.forEach((obj, index) => {
            const initialRotation = this.initialRotations[index];
            const newRotation = initialRotation + currentAngle;
            
            switch (this.axis) {
                case 'x':
                    obj.rotation.x = newRotation;
                    break;
                case 'y':
                    obj.rotation.y = newRotation;
                    break;
                case 'z':
                    obj.rotation.z = newRotation;
                    break;
            }
        });
        
        if (progress < 1) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.isComplete = true;
        
        // Ensure final angle is set exactly
        this.objects.forEach((obj, index) => {
            const initialRotation = this.initialRotations[index];
            const finalRotation = initialRotation + this.angle;
            
            switch (this.axis) {
                case 'x':
                    obj.rotation.x = finalRotation;
                    break;
                case 'y':
                    obj.rotation.y = finalRotation;
                    break;
                case 'z':
                    obj.rotation.z = finalRotation;
                    break;
            }
        });
        
        // Call completion callback
        if (this.onComplete) {
            this.onComplete();
        }
    }
    
    // Easing function for smooth animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Stop animation
    stop() {
        this.isComplete = true;
    }
}

// Realistic motion class that rotates objects around a center point like a real cube
export class RealisticMotion {
    constructor(objects, center, axis, angle, onComplete = null) {
        this.objects = Array.isArray(objects) ? objects : [objects];
        this.center = center;
        this.axis = axis;
        this.angle = angle;
        this.onComplete = onComplete;
        this.duration = 600; // 0.6 seconds for realistic cube rotation
        this.startTime = Date.now();
        this.isComplete = false;
        
        // Store initial positions and rotations
        this.initialPositions = this.objects.map(obj => obj.position.clone());
        this.initialRotations = this.objects.map(obj => obj.rotation.clone());
        
        this.start();
    }
    
    start() {
        this.animate();
    }
    
    animate() {
        if (this.isComplete) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Easing function for smooth animation
        const easedProgress = this.easeInOutCubic(progress);
        const currentAngle = this.angle * easedProgress;
        
        // Apply rotation around center to all objects
        this.objects.forEach((obj, index) => {
            const initialPos = this.initialPositions[index];
            const initialRot = this.initialRotations[index];
            
            // Create rotation matrix around the center
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis(this.axis, currentAngle);
            
            // Translate to origin, rotate, then translate back
            const relativePos = initialPos.clone().sub(this.center);
            relativePos.applyMatrix4(rotationMatrix);
            const newPos = relativePos.add(this.center);
            
            // Apply new position
            obj.position.copy(newPos);
            
            // Apply rotation to the object itself
            obj.rotation.copy(initialRot);
            obj.rotateOnAxis(this.axis, currentAngle);
        });
        
        if (progress < 1) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.isComplete = true;
        
        // Ensure final positions and rotations are set exactly
        this.objects.forEach((obj, index) => {
            const initialPos = this.initialPositions[index];
            const initialRot = this.initialRotations[index];
            
            // Calculate final position
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis(this.axis, this.angle);
            
            const relativePos = initialPos.clone().sub(this.center);
            relativePos.applyMatrix4(rotationMatrix);
            const finalPos = relativePos.add(this.center);
            
            // Set final position and rotation
            obj.position.copy(finalPos);
            obj.rotation.copy(initialRot);
            obj.rotateOnAxis(this.axis, this.angle);
        });
        
        // Call completion callback
        if (this.onComplete) {
            this.onComplete();
        }
    }
    
    // Easing function for smooth animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Stop animation
    stop() {
        this.isComplete = true;
    }
} 