const fm = require("first-mate");
const util = require("util");
const fs = require("fs");
const walk = require("walk");
const path = require("path");
const glob = util.promisify(require('glob'));

exports.glob = glob;
exports.readFile = util.promisify(fs.readFile);
exports.writeFile = util.promisify(fs.writeFile);
exports.abstractMethodError = () => { throw new Error("Abstract method not implemented"); };

exports.getGrammarAsync = async function(...grammarFiles) {
    const registry = new fm.GrammarRegistry();
    const loadGrammar = util.promisify(registry.loadGrammar.bind(registry));
    const grammars = await Promise.all(grammarFiles.map(f => loadGrammar(path.resolve(__dirname, f))));
    return grammars[grammars.length - 1];
}

exports.once = (fn) => {
    let called = false;
    return () => {
        if (!called) {
            fn();
            called = true;
        }
    };
}

exports.counter = (i = 0) => {
    return () => i++;
}

exports.processDirectory = async function(baseDir, fileNameRegex, fn) {
    return new Promise((resolve, reject) => {
        const walker = walk.walk(baseDir);
        walker.on("file", (root, fileStats, next) => {
            const fileName = path.join(root, fileStats.name);
            if (fileStats.name.match(fileNameRegex)) {
                fn(fileName)
                    .then(next)
                    .catch(e => console.error(`Error while processing ${fileName}`, e));
            } else {
                next();
            }
        });
        walker.on("end", resolve);
        walker.on("end", reject);
    });

}
