import { PhysicsEngine } from "./engine/physics.js";
import { FPSHelper } from "./helpers/fpsHelper.js";
import { Renderer } from "./renderer/renderer.js";
import { ParticleInitializer } from "./utils/particleInitializer.js";

export class Application {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;

        this.renderer = new Renderer(this.canvas, this.settings);
        this.engine = new PhysicsEngine(this.settings);
        this.fpsHelper = new FPSHelper(1000);

        this.particles = ParticleInitializer.swirl(this.settings)
    }

    render(timestamp) {
        this.engine.step(this.particles)
        this.renderer.render(this.particles)

        this.fpsHelper.update();
        
        requestAnimationFrame(this.render.bind(this))
}
}