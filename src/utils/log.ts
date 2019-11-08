import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const term = new Terminal({
    fontFamily: 'Droid Sans Mono',
    fontSize: 12,
});
const fitAddon = new FitAddon();
const terminalHTMLElement = document.getElementById('terminal');

if (terminalHTMLElement !== null) {
    term.loadAddon(fitAddon);
    term.open(terminalHTMLElement);
    fitAddon.fit();
}

export function print(s: any) {
    if (typeof s === 'string') {
        term.writeln(s);
        return;
    }

    const lines = JSON.stringify(s, null, 4).split('\n');

    lines.forEach(line => term.writeln(line));
}