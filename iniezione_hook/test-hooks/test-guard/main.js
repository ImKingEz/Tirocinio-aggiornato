const yargs = require('yargs');
const fs = require('fs');
const promisify = require('util').promisify;
const path = require('path');

const TextMateCrawler = require("./crawlers/textMateCrawler");
//const HtmlClassCrawler = require("./crawlers/htmlClassCrawler");
const HtmlTestSuiteCrawler = require("./crawlers/htmlTestSuiteCrawler");

const hookPrefix = "x-test-hook-";
const templatePrefix = 'x-test-tpl-';
const stat = promisify(fs.stat);

const baseOptions = {
    grammar: {
        demandOption: true,
        nargs: 1,
        describe: 'Grammar name',
        type: 'string',
        choices: ['angularjs', 'html', 'php', 'smarty', 'twig', 'freemarker']
    }
};

const suitesOptions = Object.assign({}, baseOptions, {
    suites: {
        demandOption: true,
        nargs: 1,
        describe: 'Path of test suites',
        type: 'string'
    }
});

const optionsBuilder = o => yargs => yargs.options(o);

yargs
    .detectLocale(false)
    .usage('Usage: $0 <command> [glob] [options]')
    .command({
        command: 'inject-hooks',
        desc: 'Injects test hooks in HTML files',
        builder: optionsBuilder(baseOptions),
        handler: asyncHandler(injectHooksHandler)
    })
    .command({
        command: 'verify-hooks',
        desc: 'Runs consistency checks between templates and test suites',
        builder: optionsBuilder(suitesOptions),
        handler: asyncHandler(verifyHooksHandler)
    })
    .command({
        command: 'remove-hooks',
        desc: 'Remove unused test hooks from HTML files',
        builder: optionsBuilder(suitesOptions),
        handler: asyncHandler(removeHooksHandler)
    })
    .command({
        command: 'show-used-hooks',
        desc: 'Show used test hooks',
        builder: optionsBuilder(suitesOptions),
        handler: asyncHandler(showUsedHooksHandler)
    })
    .demandCommand(1, 1)
    .strict(true)
    .argv;


async function injectHooksHandler(argv) {
    const glob = argv._[1];
    const templateCrawler = new TextMateCrawler(glob, hookPrefix, templatePrefix, argv.grammar);
    const counter = await templateCrawler.nextIndex() + 1;
    await templateCrawler.injectHooks(counter);
}


async function verifyHooksHandler(argv) {
    const glob = argv._[1];
    const templateCrawler = new TextMateCrawler(glob, hookPrefix, templatePrefix, argv.grammar);
    const testSuiteCrawler = await getTestSuiteCrawler(argv);
    const templateHookMap = await templateCrawler.getTemplateHookMap();
    await testSuiteCrawler.validateHooks(templateHookMap);
}

async function removeHooksHandler(argv) {
    const glob = argv._[1];
    const templateCrawler = new TextMateCrawler(glob, hookPrefix, templatePrefix, argv.grammar);
    const testSuiteCrawler = await getTestSuiteCrawler(argv);
    const usedHooks = await testSuiteCrawler.getUsedHooks();
    await templateCrawler.removeHooks(usedHooks);
}

async function showUsedHooksHandler(argv) {
    const testSuiteCrawler = await getTestSuiteCrawler(argv);
    console.log(Array.from(await testSuiteCrawler.getUsedHooks()));
}

async function getTestSuiteCrawler(argv) {
    const testPath = path.resolve(process.cwd(), argv.suites);
    if (!(await stat(testPath)).isDirectory()) {
        throw new Error("'suites' must be a directory");
    }
    return new HtmlTestSuiteCrawler(testPath, hookPrefix, templatePrefix);
}

function asyncHandler(fn) {
    return (...args) => fn(...args).catch(e => {
        console.error(e.toString());
        process.exit(1);
    });
}
