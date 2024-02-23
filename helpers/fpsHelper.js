export class FPSHelper {
    constructor(updateFrequency) {
        this.updateFrequency = updateFrequency; 

        this.frameCount = 0;
        this.lastUpdateTime = Date.now();
        this.fps = 0;

        this._init();
    }

    _init() {
        this.fpsElement = document.createElement('p');

        this.fpsElement.style = "color: green";
        this.fpsElement.innerText = this.fps;

        document.body.append(this.fpsElement)
    }

    update() {
        const now = Date.now();
        const dt = now - this.lastUpdateTime;

        if (dt > this.updateFrequency) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastUpdateTime = now;
            this.fpsElement.innerText = this.fps
        }

        this.frameCount++;
    }
}