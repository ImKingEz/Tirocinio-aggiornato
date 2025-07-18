const htmlGrammar = require("../html/grammar");
const path = require("path");

module.exports = {
    main: 'Smarty',
    files:  [
        './smarty.cson'
    ]
    .map(p => path.resolve(__dirname, p))
    .concat(htmlGrammar.files)
};
