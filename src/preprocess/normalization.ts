import { toFixed } from '../utils';

export function normalization(): Array<any> {
    if (localStorage.hasOwnProperty('normalized-dataset')) { // use cache by default
        return JSON.parse(localStorage.getItem('normalized-dataset'));
    }

    const dataset: Array<any> = JSON.parse(localStorage.getItem('dataset'));
    let maxAndMins = {};

    dataset.forEach(sample => {   
        const props = JSON.parse(JSON.stringify(sample));

        delete props.truth;    
        for (let attribute in props) {
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
        const props = JSON.parse(JSON.stringify(sample));

        delete props.truth;
        for (let attribute in props) {
            const { max, min } = maxAndMins[`${ attribute }`];
            sample[`${ attribute }`] = normalize(sample[`${ attribute }`], min, max);
        }
    });
    localStorage.setItem('normalized-dataset', JSON.stringify(dataset));

    return dataset;
}

function normalize(value: number, min: number, max: number) {
    let result = (value - min)/(max - min);

    return toFixed(result);
}