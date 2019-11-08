import 'xterm/css/xterm.css';
import './index.css';
import { normalization } from './preprocess';
import { green, print, red, yellow } from './utils';

import dataset from '../data/abalone/abalone.json';

if (!localStorage.hasOwnProperty('dataset')) {
    localStorage.setItem('dataset', JSON.stringify(dataset));
}

const normalizedDataset = normalization();

print(normalizedDataset);
