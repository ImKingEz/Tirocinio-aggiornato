const htmlGrammar = require("../html/grammar");
const path = require("path");

module.exports = {
    main: 'FreeMarker',
    files:  [
        './freemarker.cson',
    ]
    .map(p => path.resolve(__dirname, p))
    .concat(htmlGrammar.files)
};
