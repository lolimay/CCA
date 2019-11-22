import 'xterm/css/xterm.css';
import './index.css';
import { normalization } from './preprocess';
import { getRandomInt, toFixed, print } from './utils';

import originalDataset from '../data/iris/iris.json';

if (!localStorage.hasOwnProperty('dataset')) {
    localStorage.setItem('dataset', JSON.stringify(originalDataset));
}

let trainingRound = 0; // 找覆盖中心的迭代次数
let covers = new Map<any, Array<any>>(); // 用于存放所有的覆盖
// 全局变量

let dataset = normalization(); // 数据集归一化
project(dataset); // 数据集升维

// 初始状态
console.log(`
👀👀👀 Initial status 👀👀👀
dataset.length: ${ dataset.length } 👏
setosa.length: ${ dataset.filter(({ truth }) => truth === 'setosa').length } 👍
versicolor.length: ${ dataset.filter(({ truth }) => truth === 'versicolor').length } 👻
virginica.lenth: ${ dataset.filter(({ truth }) => truth === 'virginica').length } 🙀
R: ${
    dataset.map(sample => {
        let sum = 0;
        for (let attribute in sample) {
            if (attribute === 'truth') {
                continue;
            }
            sum = sum + sample[attribute] * sample[attribute];
        }
        return sum;
    }).reduce((pre, curr) => pre += curr) / dataset.length
}
`.trim());

construct(); // 覆盖性构造算法

// 打印所有覆盖
for (let cover of covers.values()) {
    console.log(cover);
}

// 分类器
// 根据得到的覆盖集，对一个未知的样本进行预测
function classifier(sample, covers) {
    let predict; // 预测值

    for (let cover of covers.values()) {
        if ()
    }
}

// CCA构造算法核心
function construct() {
    console.log(`🎉🎉🎉 Training Round ${ ++trainingRound } 🎉🎉🎉`);
    const { index: coverCenterIndex, sample: coverCenter } = getARandomCoverCenter(dataset);

    coverCenter.theta = getTheta(coverCenter, dataset); 
    covers.set(coverCenter, [coverCenter]); // 先把覆盖中心本身加到它这个覆盖中
    dataset.splice(coverCenterIndex, 1); // 再把它从数据集中移除
    
    if (dataset.length !== 1) {
        dataset.forEach(sample => {
            const d = getDotProduct(sample, coverCenter); // 样本与覆盖中心的距离(实际是内积)
            if (d > coverCenter.theta) { // 样本与覆盖中心的内积小于 theta, 表示该样本在该覆盖中
                covers.get(coverCenter).push(sample);
                sample.isCovered = true;
            }
        });
        dataset = updateCoveredSamples(dataset);
    }
    
    console.log(`
    cover.length: ${ covers.get(coverCenter).length }\ndataset.length: ${ dataset.length }
    `.trim());
    const truth = covers.get(coverCenter)[0].truth;
    covers.get(coverCenter).forEach(sample => {
        if (sample.truth !== truth) {
            throw new Error('训练出错！');
        }
    });
    if (dataset.length > 0) {
        construct();
    }
}

// 更新被覆盖的样本（即将标记为被覆盖的样本从数据集中移除）
function updateCoveredSamples(dataset): Array<string> {
    return dataset.filter(sample => sample.hasOwnProperty('isCovered') === false);
}

// 求内积
function getDotProduct(sample, coverCenter) {
    let dotProduct = 0;
    for (let attribute in sample) {
        if (typeof sample[attribute] === 'number') {
            dotProduct += sample[attribute] * coverCenter[attribute];
        }
    }
    
    return dotProduct;
}

// 求覆盖中心的 theta
// 覆盖中心的 theta = (同类最大半径 + 异类最小半径) / 2
function getTheta(coverCenter, dataset: Array<any>): number {
    let theta, max, min;

    getMaximumRadius(coverCenter , dataset).forEach(value => {
        min = getMinimumRadius(coverCenter, dataset);
        if (min < value) {
            max = value;
            theta = (min + max )/2;
        }
    });
    return theta;
}

// 获取同类最大半径集合
function getMaximumRadius(coverCenter, dataset: Array<any>): Array<any> {
    const sameSamples = dataset.filter(sample => sample.truth === coverCenter.truth);

    return sameSamples.sort((a, b) => {
        const aDotProduct = getDotProduct(coverCenter, a);
        const bDotProduct = getDotProduct(coverCenter, b);

        return aDotProduct > bDotProduct ? 1 : -1;
    }).map(sample => getDotProduct(sample, coverCenter));
}

// 获取异类最小半径
// 实际上是找异类中与覆盖中心内积最大的值
function getMinimumRadius(coverCenter, dataset: Array<any>): number {
    const oppositeSamples = dataset.filter(sample => sample.truth !== coverCenter.truth);
    let minimumRadius;

    oppositeSamples.forEach(sample => {
        let dotProduct = 0;
        for (let attribute in sample) {
            if (typeof sample[attribute] === 'number') {
                dotProduct += sample[attribute] * coverCenter[attribute];
            }
        }
        if (typeof minimumRadius === 'undefined') {
            minimumRadius = dotProduct;
        }
        if (minimumRadius < dotProduct) {
            minimumRadius = dotProduct;
        }
    });

    return minimumRadius;
}

// 获取一个随机覆盖中心
export function getARandomCoverCenter(dataset: Array<any>) {
    const index = getRandomInt(dataset.length - 1);

    return {
        index,
        sample: dataset[index]
    };
}

// 计算样本的模长平方
function getModularSquare(sample: any): number {
    let modularSquare = 0;
    for (let attribute in sample) {
        if (typeof sample[attribute] === 'number') {
            modularSquare += sample[attribute] * sample[attribute];
        }
    }
    return toFixed(modularSquare);
}

// 获取数据集中的模长平方最大的样本（以它作为升维空间的半径）
function getRSquare(dataset: Array<any>): number {
    let max = 0;
    dataset.forEach(sample => {
        const modularSquare = getModularSquare(sample);

        if (max < modularSquare) {
            max = modularSquare;
        }
    });
    return(toFixed(max));
}

// 数据集升维
function project(dataset: Array<any>): void {
    const rSquare = getRSquare(dataset);

    dataset.forEach(sample => {
        const modularSquare = getModularSquare(sample);
        const _balance = Math.sqrt(rSquare - modularSquare);
        sample._balance = _balance;
    });
}