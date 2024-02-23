export class Backend {
    constructor(path) {
        this.worker = new Worker(path, {type: 'module'});
    }

    async init(onData, onReady, settings) {
        this.worker.onmessage = (e) => {
            const {type} = e.data;

            switch (type) {
                case 'data':
                    onData(e.data);
                    break;
                case 'ready':
                    onReady(e.data);
                    break;
            }
        }
        this.worker.postMessage({type: 'init', settings: settings})
    }

    requestNextStep() {
        this.worker.postMessage({type: 'step'})
    }
}