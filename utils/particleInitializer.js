export class ParticleInitializer {

    static swirl(settings) {
        const {worldWidth, worldHeight} = settings.world;
        const {particleCount, gravity} = settings.physics;
    
        const particles = this._init(particleCount);
    
        const centerX = worldWidth / 2,
            centerY = worldHeight / 2;
    
        const maxRadius = Math.min(worldWidth, worldHeight) / 2;
        const minRadius = maxRadius / 64;
        const wiggle = maxRadius / 8;
    
        const maxAngle = Math.PI * 2;
        const spiralSize = maxAngle / 16;
        const step = maxAngle / particleCount;
        let angle = 0;
    
        for (let i = 0; i < particleCount; i++) {
            const r = (minRadius + (angle / spiralSize - Math.floor(angle / spiralSize)) * (maxRadius - minRadius) + Math.random() * wiggle);
            particles[i].x = centerX + Math.cos(angle) * r;
            particles[i].y = centerY + Math.sin(angle) * r;
    
            particles[i].velX = Math.cos(angle - Math.PI / 2) * (0.1 + r / maxRadius) * gravity * 0.5;
            particles[i].velY = Math.sin(angle - Math.PI / 2) * (0.1 + r / maxRadius) * gravity * 0.5;
    
            angle += step;
        }
    
        return particles;
    }

    static _init(particleCount) {
        let particles = new Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            particles[i] = {
                x: 0,
                y: 0,
                velX: 0,
                velY: 0,
                mass: 1
            }
        }

        return particles;
    }
}
