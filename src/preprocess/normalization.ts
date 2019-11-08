function normalize(value: number, min: number, max: number, precision?: number) {
    let result = (value - min)/(max - min);

    if (typeof precision === 'number') {
        result = parseFloat(result.toFixed(precision));
    }
    return result;
}

export function normalization() {
    if (localStorage.hasOwnProperty('normalized-dataset')) { // use cache by default
        return;
    }

    const dataset: Array<any> = JSON.parse(localStorage.getItem('dataset'));
    let maxAndMins = {};

    dataset.forEach(sample => {
        delete sample.truth;
        
        for (let attribute in sample) {
            if (!maxAndMins[`${ attribute }`]) {
                maxAndMins[`${ attribute }`] = {};
            }
            if (!maxAndMins[`${ attribute }`].min || maxAndMins[`${ attribute }`].min > sample[`${ attribute }`]) {
                maxAndMins[`${ attribute }`].min = sample[`${ attribute }`];
            }
            if (!maxAndMins[`${ attribute }`].max || maxAndMins[`${ attribute }`].max < sample[`${ attribute }`]) {
                maxAndMins[`${ attribute }`].max = sample[`${ attribute }`];
            }
        }
    });
    dataset.forEach(sample => {
        for (let attribute in sample) {
            const { max, min } = maxAndMins[`${ attribute }`];
            sample[`${ attribute }`] = normalize(sample[`${ attribute }`], min, max, 3);
        }
    });
    localStorage.setItem('normalized-dataset', JSON.stringify(dataset));
}