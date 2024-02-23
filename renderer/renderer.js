export class Renderer {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.canvas.width = settings.world.worldWidth;
        this.canvas.height = settings.world.worldHeight;
        this.context = this.canvas.getContext('2d');
        

        this._updateRenderImageData()

        this.settings = settings;
        this._scale = {
            x: 1,
            y: 1
        };

        this._maxSpeed = this.settings.physics.gravity / 100;
    }

    render(particles) {
        this._clearCanvas()
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
    
            if (
                particle.x >= this.canvas.width || particle.x <= 0 ||
                particle.y >= this.canvas.height || particle.y <= 0
                ) {
                    continue
            }

            let x = Math.floor(particle.x * this._scale.x);
            let y = Math.floor(particle.y * this._scale.y);
    
            const index = ( x + y * this.canvas.width );
            

            this._maxSpeed = Math.max(this._maxSpeed, Math.abs(particle.velX), Math.abs(particle.velY));
            const mass = Math.floor(255 * (0.25 + particle.mass / (this.settings.physics.particleMass + 1) * 0.25));
            const xVelToColor = Math.floor(255 * (0.5 + particle.velX / this._maxSpeed * 0.5));
            const yVelToColor = Math.floor(255 * (0.5 + particle.velY / this._maxSpeed * 0.5));
            const color = 0xff000000 | xVelToColor << 16 | mass << 8 | yVelToColor;
    
            this.pixels[index] = this._blendColors(this.pixels[index], color);
        }
        this.context.putImageData(this.renderImageData, 0, 0)
    }

    _clearCanvas() {
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i] = 0;
        }
    }

    _updateRenderImageData() {
        this.renderImageData = this.context.createImageData(Math.ceil(this.canvas.width), Math.ceil(this.canvas.height));
        this.pixels = new Uint32Array(this.renderImageData.data.buffer);
    }

    _blendColors(bottom, top) {
        const bottomR = bottom >> 16 & 0xff,
            bottomG = bottom >> 8 & 0xff,
            bottomB = bottom & 0xff;

        const topR = top >> 16 & 0xff,
            topG = top >> 8 & 0xff,
            topB = top & 0xff

        const r = Math.floor(Math.min(255, Math.max(0, topR * topR / 255 + bottomR)));
        const g = Math.floor(Math.min(255, Math.max(0, topG * topG / 255 + bottomG)));
        const b = Math.floor(Math.min(255, Math.max(0, topB * topB / 255 + bottomB)));

        return 0xff000000 | r << 16 | g << 8 | b;
    }
}