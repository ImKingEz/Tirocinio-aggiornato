const htmlGrammar = require("../html/grammar");
const path = require("path");
    
module.exports = {
    main: 'PHP',
    files:  [
        './php.cson',
        './html-php.cson'
    ]
    .map(p => path.resolve(__dirname, p))
    .concat(htmlGrammar.files)
};