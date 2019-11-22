import { getRandomInt } from '../src/utils';

const LEN = 10000;
const TESTING_TIMES = Math.pow(10, 6);

test('getRandomInt', () => {
    
    let coverMax = false;
    let coverMin = false;
    for (let i = 0; i < TESTING_TIMES; i++) {
    
        if (getRandomInt(LEN) === LEN) {
            coverMax = true;
        }
        if (getRandomInt(LEN) === 0) {
            coverMin = true;
        }
    }
    expect(coverMax).toBeTruthy;
    expect(coverMin).toBeTruthy;
});