const jsdomLib = require("jsdom");
const fs = require("fs");
const yargs = require('yargs');
const utils = require("./crawlers/utils");
const path = require("path");

const JSDOM = jsdomLib.JSDOM;
const TEST_ROW_XPATH = "/html/body//tbody/tr";
const OPTION_XPATH = ".//datalist/option"
const LOCATOR_XPATH = "./td[2]";

const hookPrefix = "x-test-hook-";
const templatePrefix = 'x-test-tpl-';
const HOOK_REGEX = new RegExp(`(?:(?:${hookPrefix})|(?:${templatePrefix}))\\d+`, 'g');
const htmlFileRegex = /\.html$/;

const args = yargs
    .detectLocale(false)
    .options({
        suites: {
            demandOption: true,
            nargs: 1,
            describe: 'Path of test suites (containing HTML files)',
            type: 'string'
        },
        dest: {
            demandOption: true,
            nargs: 1,
            describe: 'Path of destination directory',
            type: 'string'
        },
        num: {
            demandOption: true,
            nargs: 1,
            describe: 'Number of considered locators',
            type: 'string'
        }
    })
    .argv;


let numLocator=parseInt(args.num);
let n=0;
while(n<numLocator){
jsdomProcessFiles(args.suites, splitTest,n+2).catch(console.error);
n++;
}

async function splitTest(node,filename,num) {
	//console.log(num);
    const elements = node.evaluate(TEST_ROW_XPATH, node, null, 5); //ORDERED_NODE_ITERATOR_TYPE

    let element, optionElement;
    while ((element = elements.iterateNext())) {
        if (element.textContent.match(HOOK_REGEX)) { //Verifica che quello da modificare sia una hook expression
            const optionElements = node.evaluate(OPTION_XPATH, element, null, 5); //ORDERED_NODE_ITERATOR_TYPE
            //console.log(num+"-"+optionElements.length);
			let newLocator = null;
			let i=0;
			for (i=0;i<num;i++){
				optionElement = optionElements.iterateNext()
			}
            //while ((optionElement = optionElements.iterateNext())) {
                if (optionElement.textContent.match(HOOK_REGEX)) {
                    //   optionElement.remove();
                } else if (!newLocator) { //trova il primo locatore opzionale
                    newLocator = optionElement.innerHTML
					//console.log(num+newLocator);
                }
            //}
            const td = node.evaluate(LOCATOR_XPATH, element, null, 5).iterateNext();
            td.childNodes[0].nodeValue = newLocator;
        }
    }
}


 function jsdomProcessFiles(baseDir, processor,num) {
    return utils.processDirectory(baseDir, htmlFileRegex, async (fileName) => {
        return jsdomProcessFile(fileName, processor,num);
    });
}


async function jsdomProcessFile(fileName, processor,num) {
    const content = await utils.readFile(fileName, "utf8");
    const destFolder = path.resolve(args.dest);
	let numId=num-2;
    mkDirByPathSync(destFolder.concat(numId));

    if (content.indexOf('</html>') > 0) {
        const dom = new JSDOM(content);
        const document = dom.window.document;
        processor(document, fileName,num);
        const newFileName = path.join(destFolder.concat(numId), path.basename(fileName));
        const stream = fs.createWriteStream(newFileName);
        stream.write(dom.serialize());
        stream.end();

    } else {
        console.warn("Cannot find root node for " + fileName);
    }

}



function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
                return curDir;
            }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
        }

        return curDir;
    }, initDir);
}