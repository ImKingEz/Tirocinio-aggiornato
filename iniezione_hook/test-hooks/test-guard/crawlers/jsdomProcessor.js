const utils = require("./utils");
const jsdomLib = require("jsdom");
const fs = require("fs");


const JSDOM = jsdomLib.JSDOM;
const htmlFileRegex = /\.html$/;

async function jsdomProcessFiles(baseDir, processor, writeOutput = false) {
    return utils.processDirectory(baseDir, htmlFileRegex, async (fileName) => {
        return jsdomProcessFile(fileName, processor, writeOutput);
    });
}


async function jsdomProcessFile(fileName, processor, writeOutput = false) {
    const content = await utils.readFile(fileName, "utf8");

    if (content.indexOf('</html>') > 0) {
        const dom = new JSDOM(content);
        const document = dom.window.document;
        processor(document, fileName);
        if (writeOutput) {
            const stream = fs.createWriteStream(fileName);
            stream.write(dom.serialize());
            stream.end();
        }
    } else {
        const fragment = JSDOM.fragment(content);
        processor(fragment, fileName);
        if (writeOutput) {
            const stream = fs.createWriteStream(fileName);
            Object.values(fragment.children).forEach(c => stream.write(c.outerHTML));
            stream.end();
        }
    }

}

module.exports = jsdomProcessFiles;
