import { PhysicsEngine } from "./engine/physics.js";
import { FPSHelper } from "./helpers/fpsHelper.js";
import { Renderer } from "./renderer/renderer.js";
import { ParticleInitializer } from "./utils/particleInitializer.js";
import { ITEM_SIZE, WorkerBackend } from "./worker/worker.js";

export class Application {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.backend = new WorkerBackend();
        this.renderer = new Renderer(this.canvas, this.settings);
        this.fpsHelper = new FPSHelper(1000);

        this.particles = new Array(this.settings.physics.particleCount);
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i] = {x: 0, y: 0, velX: 0, velY: 0, mass: 1}
        }
        this.aheadBuffers = [];
        this.wasFirstData = false;
    }

    init() {
        this.backend.init(this.onData.bind(this), this.requestNextStep.bind(this), this.settings)
    }

    run() {
        requestAnimationFrame(this.render.bind(this))
    }

    render(timestamp) {
        
        if (!this.wasFirstData) {
            requestAnimationFrame(this.render.bind(this))
            return
        }
        console.log(this.aheadBuffers.length)
        this.prepareNextStep();
        this.renderer.render(this.particles)

        this.fpsHelper.update();
        
        requestAnimationFrame(this.render.bind(this))
    }

    onData(data) {
        this.aheadBuffers.push(data.buffer);
        if (this.aheadBuffers.length === this.settings.simulation.bufferCount) {
            if (!this.wasFirstData) this.wasFirstData = true
        } else {
            if (!this.wasFirstData) {
                this.requestNextStep()
            }
        }
        
    }

    prepareNextStep() {
        if (this.aheadBuffers.length === 0) {
            return
        }

        const buffer = this.aheadBuffers.shift();
        
        for (let i = 0; i < this.settings.physics.particleCount; i++) {
            this.particles[i].x = buffer[i * ITEM_SIZE];
            this.particles[i].y = buffer[i * ITEM_SIZE + 1];
            this.particles[i].velX = buffer[i * ITEM_SIZE + 2];
            this.particles[i].velY = buffer[i * ITEM_SIZE + 3];
            this.particles[i].mass = buffer[i * ITEM_SIZE + 4];
        }

        this.backend.freeBuffer(buffer)

        this.requestNextStep();
    }

    requestNextStep() {
        this.backend.requestNextStep();
    }
}