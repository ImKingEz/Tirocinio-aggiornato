const path = require("path");

module.exports = {
    main: 'HTML',
    files: [
        './html.cson'
    ].map(p => path.resolve(__dirname, p))
};