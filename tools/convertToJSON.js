const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const { exit } = process;

if (process.argv.length <= 2) {
    console.error(`${ chalk.red('[Error]') } Need to pass the original data file's path.`);
    return;
}

// ../data/abalone/abalone.data
const basePath = path.join(__dirname, process.argv[2]);
const basename = path.basename(basePath);
const dataPath = `${ basePath }/${ basename }.data`;
const descPath = `${ basePath }/metadata.json`;
const savePath = `${ basePath }/${ basename }.json`;

if (!fs.existsSync(dataPath) || !fs.existsSync(descPath)) {
    console.error(`${ chalk.red('[Error]') } The essential files not exist!`);
    return;
}

const names = fs.readFileSync(descPath);
let { attributes, numberOfInstances } =  JSON.parse(String(names));
const data = fs.readFileSync(dataPath);
const samples = String(data).split('\n');

let dataset = samples.map(sample => {
    const props = sample.split(',');
    
    if (props.length === 1) {
        return;
    }

    const result = {
        truth: props[4]
    };

    attributes.forEach((attribute, index) => {
        result[attribute] = parseFloat(props[index]);
    });

    return result;
});

dataset = dataset.filter(sample => !!sample);

if (dataset.length === numberOfInstances) {
    fs.writeFileSync(savePath, JSON.stringify(dataset, null, 4));
    console.info(`${ chalk.green('[Info]') } success!`);
} else {
    console.error(`${ chalk.red('[Error]') } Internal error!`);
}