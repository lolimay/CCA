import 'xterm/css/xterm.css';
import './index.css';
import { normalization } from './preprocess';
import { getRandomInt, toFixed } from './utils';

import originalDataset from '../data/iris/iris.json';

const splittedDatasets = []; // 分割后的数据集
// 全局变量

// 十交叉随机分成10个子数据集
for (let i=0; i < 10; i++) {
    splittedDatasets.push([]);
}
while (originalDataset.length > 0) {
    splittedDatasets.forEach(subDataset => {
        subDataset.push(...originalDataset.splice(getRandomInt(originalDataset.length), 1));
    });
}

// 测试准确率，10次取平均
let accuracies = [];
for (let i=0; i<10; i++) {
    accuracies.push(testAccuracy());
}
let average_accuracy = accuracies.reduce((pre, cuur) => pre + cuur) / accuracies.length;
const rate_difference = accuracies.reduce((pre, curr) => pre + (curr - average_accuracy) * (curr - average_accuracy)) / accuracies.length;

console.log(
    'avaerage_accuracy: ', (average_accuracy * 100).toFixed(4).toString() + '%',
    'rate_difference: ', (rate_difference * 100).toFixed(4).toString() + '%'
);

// 测试准确率
function testAccuracy() {
    let total_success_rate = 0;
    for(let i=0; i<10; i++) {
        let trainingRound = 0; // 找覆盖中心的迭代次数
        let covers = new Map<any, Array<any>>(); // 用于存放所有的覆盖
        let testingDataset = splittedDatasets[i]; // 训练数据集
        let trainingDataset = splittedDatasets.filter(dataset => dataset !== testingDataset).reduce((pre, cur) => pre.concat(cur));

        testingDataset = JSON.parse(JSON.stringify(testingDataset));
        trainingDataset = JSON.parse(JSON.stringify(trainingDataset));

        let dataset = normalization(trainingDataset); // 数据集归一化
        dataset = project(dataset); // 数据集升维

        construct(dataset, trainingRound, covers); // 覆盖性构造算法

        // 测试
        let total_count = testingDataset.length;
        let success_count = 0;
        let success_rate = 0;
        testingDataset.forEach(sample => {
            for (let coverCenter of covers.keys()) {
                const innerProduct = getDotProduct(sample, coverCenter);
                const theta = coverCenter.theta + 1;

                if (innerProduct > theta && sample.truth === coverCenter.truth) {
                    success_count++; // 预测成功
                    return;
                }
            }
        });
        success_rate = success_count / total_count;
        total_success_rate += success_rate;
    }
    console.log('本次准确率: ', total_success_rate / 10);
    return total_success_rate / 10;
}

// CCA构造算法核心
function construct(dataset, trainingRound, covers) {
    const { index: coverCenterIndex, sample: coverCenter } = getARandomCoverCenter(JSON.parse(JSON.stringify(dataset)));

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
    
    const truth = covers.get(coverCenter)[0].truth;
    covers.get(coverCenter).forEach(sample => {
        if (sample.truth !== truth) {
            throw new Error('训练出错！');
        }
    });
    if (dataset.length > 0) {
        construct(dataset, trainingRound, covers); // 覆盖性构造算法
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
function project(dataset: Array<any>): Array<any> {
    const rSquare = getRSquare(dataset);

    return dataset.map(sample => {
        const modularSquare = getModularSquare(sample);
        const _balance = Math.sqrt(rSquare - modularSquare);
        sample._balance = _balance;

        return sample;
    });
}