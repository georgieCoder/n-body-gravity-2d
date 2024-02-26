export class Stats {
    renderTime;
    calcTime;
    frameTime;

    constructor() {
        this._init();
    }

    _init() {
        this.infoElement = document.createElement('p');

        this.infoElement.style = "color: green";
        this.infoElement.innerText = '';

        document.body.append(this.infoElement)
    }

    drawStats() {
        this.infoElement.innerText = [
            `fps: ${Math.min(60, Math.round(1000 / this.renderTime))}`,
            `render: ${this.renderTime}ms`,
            `calc: ${this.calcTime}ms`,
        ].filter(v => v).join("\n");
    }

}