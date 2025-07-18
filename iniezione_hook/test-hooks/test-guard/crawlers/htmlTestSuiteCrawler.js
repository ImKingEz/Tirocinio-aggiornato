const jsdomLib = require("jsdom");
const jsdomProcessFiles = require('./jsdomProcessor');

const JSDOM = jsdomLib.JSDOM;
const TEST_SUITE_XPATH = "/html/body//tbody/tr/td[2]/text()";

class HtmlTestSuiteCrawler {

    constructor(baseDir, hookPrefix, templatePrefix) {
        this.baseDir = baseDir;
        this.regex = new RegExp(`(?:(?:${hookPrefix})|(?:${templatePrefix}))\\d+`, 'g');
        //this.xpathRegex = new RegExp(`contains\\s*\\(\\s*@class\\s*,\\s*['"]((?:(?:${hookPrefix})|(?:${templatePrefix}))\\d+)['"]\\s*\\)`, 'g');
    }

    async getUsedHooks() {
        const hooks = new Set();
        const accumulate = list => list.map(e => e.textContent.match(this.regex))
            .filter(e => !!e)
            .reduce((e, acc) => acc.concat(e), [])
            .forEach(a => hooks.add(a));

        await jsdomProcessFiles(this.baseDir, (node) => this.findHooks(node, accumulate));
        return hooks;
    }

    async validateHooks(templateHookMap) {
        const accumulate = list => list.map(e => e.textContent.match(this.regex))
            .filter(e => !!e)
            .forEach(a => this.validateHookSet(a, templateHookMap));
        await jsdomProcessFiles(this.baseDir, (node) => this.findHooks(node, accumulate));
    }

    validateHookSet(hookSet, templateHookMap) {
        let templateHook;
        for (let hook of hookSet) {
            templateHook = templateHookMap.get(hook) || templateHook; // templateHook may contain previous value
            if (!templateHook) {
                throw new Error("Template hook not found: " + hook);
            }
            if (templateHookMap.get(hook) !== templateHook && !templateHook.hooks.has(hook)) { //not currently on template hook, check if child test hook is present
                throw new Error("Test hook " + hook + " not found for template: " + templateHook.fileName + "\nHook path: " + hookSet.join(' -> '));
            }
        }
    }

    findHooks(node, accumulate) {
        if (!node.evaluate) {
            node = new JSDOM(node).window.document;
        }

        const elements = node.evaluate(TEST_SUITE_XPATH, node, null, 5); //ORDERED_NODE_ITERATOR_TYPE

        let element = elements.iterateNext();
        const list = [];
        while (element) {
            list.push(element);
            element = elements.iterateNext();
        }

        accumulate(list);

    }

}


module.exports = HtmlTestSuiteCrawler;
