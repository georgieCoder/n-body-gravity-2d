import { PhysicsEngine } from "../engine/physics.js";
import { ParticleInitializer } from "../utils/particleInitializer.js";
import { Backend } from "./backend.js";

export const ITEM_SIZE = 5;

export class WorkerBackend extends Backend {
    constructor() {
        super('./worker/worker.js')
    }
}

class WorkerBackendImpl {
    constructor() {
    }

    async init(settings) {
        this.engine = new PhysicsEngine(settings);
        this.settings = settings;
        this.buffers = new Array(this.settings.simulation.bufferCount);
        for (let i = 0; i < this.settings.simulation.bufferCount; i++) {
            this.buffers[i] = new Float32Array(this.settings.physics.particleCount * ITEM_SIZE);
        }
        this.particles = ParticleInitializer.swirl(this.settings);
    }

    step() {
        this.engine.step(this.particles);
        const buffer = this.buffers.shift();
        this._fillBuffer(buffer);
        return {
            buffer: buffer
        }
    }

    ack(buffer) {
        if (this.buffers.length < this.settings.simulation.bufferCount) {
            this.buffers.push(buffer)
        }
    }

    _fillBuffer(buffer) {
        for (let i = 0; i < this.settings.physics.particleCount; i++) {
            buffer[i * ITEM_SIZE] = this.particles[i].x;
            buffer[i * ITEM_SIZE + 1] = this.particles[i].y;
            buffer[i * ITEM_SIZE + 2] = this.particles[i].velX;
            buffer[i * ITEM_SIZE + 3] = this.particles[i].velY;
            buffer[i * ITEM_SIZE + 4] = this.particles[i].mass;
        }
    }
}

class WorkerHandler {
    constructor(backend) {
        this.backend = backend;
    }

    handleMessage(e) {
        this._handleMessage(e).catch(error => setTimeout(() => {
            throw new Error(error.message)
        }))
    }

    async _handleMessage(e) {
        
        const {type} = e.data;

        switch (type) {
            case "init":{
                const {settings} = e.data;

                await this.backend.init(settings);

                postMessage({type: 'ready'});}
                break;
            case "step":
                const data = this.backend.step()
                postMessage({type: 'data', buffer: data.buffer}, [data.buffer.buffer])
                
                break;
            case 'ack':
                const {buffer} = e.data;
                this.backend.ack(buffer)
                break;
        }
    }
}

const WorkerInstance = new WorkerBackendImpl();
const WorkerHandlerInstance = new WorkerHandler(WorkerInstance);

onmessage = WorkerHandlerInstance.handleMessage.bind(WorkerHandlerInstance)