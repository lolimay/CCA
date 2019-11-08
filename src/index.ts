import 'xterm/css/xterm.css';
import './index.css';
import { green, red, yellow, print } from './utils';
import { normalization } from './preprocess';

import dataset from '../data/abalone/abalone.json';

if (!localStorage.hasOwnProperty('dataset')) {
    localStorage.setItem('dataset', JSON.stringify(dataset));
}

normalization();

print(localStorage.getItem('normalized-dataset'));