const htmlGrammar = require("../html/grammar");
const path = require("path");

module.exports = {
    main: 'Twig (HTML)',
    files:  [
        './html (twig).cson'
    ]
    .map(p => path.resolve(__dirname, p))
    .concat(htmlGrammar.files)
};
