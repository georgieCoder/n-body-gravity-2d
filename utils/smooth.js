export class DataSmoother {
    constructor(count, firstDropCount = 0, useFilter = false) {
        this.count = count;
        this.dropCount = firstDropCount;
        this.useFilter = useFilter;
        
        this.smoothedValue = 0;

        this._historySum = 0;
        this._historyValues = [];
        this._historyIndex = 0;
    }

    postValue(value, force = false) {
        if (this.dropCount > 0 && !force) {
            this.dropCount -= 1;
            return;
        }

        if (this.useFilter && !force && this._historyValues.length > 0) {
            value = this._filter(value)
        }

        this._historySum += value;

        if (this._historyValues.length < this.count) {
            this._historyValues.push(value);
        } else {
            this._historySum -= this._historyValues[this._historyIndex];
            this._historyValues[this._historyIndex] = value;
        }

        this.smoothedValue = this._historySum / this._historyValues.length;

        this._historyIndex = (this._historyIndex + 1) % this.count;
    }

    _filter(value) {
        if (value < this.smoothedValue) {
            value = Math.max(value, this.smoothedValue / 2)
        }
        if (value > this.smoothedValue) {
            value = Math.min(value, this.smoothedValue * 2)
        }
        return value;
    }
}