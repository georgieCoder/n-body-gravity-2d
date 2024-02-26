import { Application } from "./app.js";

const settings = {
    world: {
        fps: 60,
        worldHeight: window.innerHeight,
        worldWidth: window.innerWidth
    },
    physics: {
        particleMass: 0,
        particleCount: 20000,
        gravity: 1,
        particleGravity: 0.00005,
        minInteractionDistanceSq: 0.001
    },
    simulation: {
        segmentMaxCount: 32,
        bufferCount: 3
    },
    common: {
        stats: false
    }
}

window.onload = function() {
    const canvas = document.getElementById('canvas');
    
    const application = new Application(canvas, settings);

    application.init();
    application.run();
}
