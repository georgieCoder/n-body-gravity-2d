import { PhysicsEngine } from "./engine/physics.js";
import { Stats } from "./helpers/Stats.js";
import { Renderer } from "./renderer/renderer.js";
import { ParticleInitializer } from "./utils/particleInitializer.js";
import { DataSmoother } from "./utils/smooth.js";
import { ITEM_SIZE, WorkerBackend } from "./worker/worker.js";

export class Application {
    lastRenderTime;

    constructor(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.backend = new WorkerBackend();
        this.renderer = new Renderer(this.canvas, this.settings);
        this.stats = new Stats(1000);

        this.particles = new Array(this.settings.physics.particleCount);
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i] = {x: 0, y: 0, velX: 0, velY: 0, mass: 1}
        }
        this.aheadBuffers = [];
        this.wasFirstData = false;
        this.pendingBuffers = 0;
    }

    init() {
        this.testSmoother = new DataSmoother(this.settings.world.fps * 4, 1);
        this.backend.init(this.onData.bind(this), this.requestNextStep.bind(this), this.settings)
    }

    run() {
        requestAnimationFrame(this.render.bind(this))
    }

    render(timestamp) {
        if (!this.wasFirstData) {
            this.lastRenderTime = timestamp
            requestAnimationFrame(this.render.bind(this))
            return
        }
        this.prepareNextStep();
        this.renderer.render(this.particles)

        const renderTime = timestamp - this.lastRenderTime;
        this.stats.frameTime = renderTime;
        this.stats.renderTime = this.renderer.stats.renderTime;
        this.stats.drawStats();
        
        this.lastRenderTime = timestamp
        requestAnimationFrame(this.render.bind(this))
    }

    onData(data) {
        this.stats.calcTime = data.time;
        this.testSmoother.postValue(this.stats.calcTime)
        console.log(this.stats.calcTime, this.testSmoother.smoothedValue)
        this.aheadBuffers.push(data.buffer);
        this.wasFirstData = true;
        this.pendingBuffers -= 1;
        
        if (this.aheadBuffers.length + this.pendingBuffers < this.settings.simulation.bufferCount) {
            this.requestNextStep()
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
        this.pendingBuffers += 1;
        this.backend.requestNextStep();
    }
}