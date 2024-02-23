import {SpatialTree} from "./tree.js";

export class PhysicsEngine {
    constructor(settings) {
        this.settings = settings;
    }

    reconfigure(settings) {
        this.settings = settings;
    }

    step(particles) {
        const tree = new SpatialTree(
            particles, 
            this.settings.simulation.segmentMaxCount, 
            this.settings.simulation.segmentDivider, 
            this.settings.simulation.segmentRandomness
        );
        
        this._calculateTree(tree);

        for (let i = 0; i < particles.length; i++) {
            this._physicsStep(particles[i]);
        }

        return tree;
    }

    _calculateTree(tree) {
        return this._calculateLeaf(tree.root, [0, 0]);
    }

    _calculateLeaf(leaf, pForce) {
        const blocks = leaf.children;
        if (blocks.length > 0) {
            this._calculateLeafBlock(leaf, pForce);
            return;
        }

        this._calculateLeafData(leaf, pForce);
    }

    _calculateLeafBlock(leaf, pForce) {
        const blocks = leaf.children;
        for (let i = 0; i < blocks.length; i++) {
            const blockCenter = blocks[i].boundaryRect.center();
            const iForce = pForce.slice();

            for (let j = 0; j < blocks.length; j++) {
                if (i === j) continue;

                const g = this.settings.physics.particleGravity * blocks[j].mass;
                this._calculateForce(blockCenter, blocks[j].boundaryRect.center(), g, iForce);
            }

            this._calculateLeaf(blocks[i], iForce);
        }
    }

    _calculateLeafData(leaf, pForce) {
        for (let i = 0; i < leaf.length; i++) {
            const attractor = leaf.data[i];
            attractor.velX += pForce[0];
            attractor.velY += pForce[1];

            for (let j = 0; j < leaf.length; j++) {
                if (i === j) continue;

                const particle = leaf.data[j];
                this._calculateForce(particle, attractor, this.settings.physics.particleGravity * attractor.mass, particle);
            }
        }
    }

    _calculateForce(p1, p2, g, out) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;

        const distSquare = dx * dx + dy * dy;

        if (distSquare < this.settings.physics.minInteractionDistanceSq) return

        
        const force = -g / distSquare;

        if (out.velX !== undefined) {
            out.velX += dx * force;
            out.velY += dy * force;
            return
        }

        out[0] += dx * force;
        out[1] += dy * force; 
    }

    _physicsStep(particle) {
        particle.x += particle.velX;
        particle.y += particle.velY;
    }

    dispose() {
        this.settings = null;
        this.stats = null;
    }
}