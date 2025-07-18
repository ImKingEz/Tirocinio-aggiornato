const htmlGrammar = require("../html/grammar");
const path = require("path");

module.exports = {
    main: 'HTML (Angular)',
    files: [
        './angularjs.cson'
    ]
        .map(p => path.resolve(__dirname, p))
        .concat(htmlGrammar.files)
};