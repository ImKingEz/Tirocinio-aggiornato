const path = require("path");
const firstMate = require("first-mate");

exports.get = async function(grammarName) {

    const descriptor = require(`./${grammarName}/grammar`);
    const grammarFiles = descriptor.files;

    const registry = new firstMate.GrammarRegistry();

    await Promise.all(grammarFiles.map(f => loadGrammarAsync(registry, path.resolve(__dirname, f))));

    let grammars = registry.getGrammars();
    
    let grammar = grammars.find(g => g.name === descriptor.main); // grammars[0] is always null grammar

    return grammar;
}


async function loadGrammarAsync(registry, file) {
    return new Promise((resolve, reject) => {
        registry.loadGrammar(file, (error, grammar) => {
            if (error) {
                reject(error);
            } else {
                resolve(grammar);
            }
        })
    });
}
