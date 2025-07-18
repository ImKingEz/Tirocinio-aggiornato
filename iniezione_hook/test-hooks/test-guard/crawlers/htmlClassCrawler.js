const BaseHtmlCrawler = require('./baseHtmlCrawler');
const jsdomProcessFiles = require('./jsdomProcessor');
const utils = require("./utils");


class HtmlClassCrawler extends BaseHtmlCrawler {

    constructor(baseDir, hookPrefix, templatePrefix) {
        super(baseDir, hookPrefix, templatePrefix);
    }

    async injectHooks(counterValue = 0) {
        this.counter = utils.counter(counterValue);
        await jsdomProcessFiles(this.baseDir, (node) => this.recursiveAddClass(node.children), true);
    }

    async removeHooks(whiteList = {}) {
        await jsdomProcessFiles(this.baseDir, (node) => this.recursiveRemoveClass(node.children, whiteList), true);
    }

    async nextIndex() {
        const indexWrapper = { value: -1 };
        await jsdomProcessFiles(this.baseDir, (node) => this.recursiveFindGreatestIndex(node.children, indexWrapper));
        return indexWrapper.value;
    }

    /*
     * Builds a map that contains a set of children test hooks for each template hook.
     * e.g.: { 'tpl-hook-1' : { hooks: { ... children hooks here ... }, fileName: "..." } }
     */
    async getTemplateHookMap() {
        const map = {};
        await jsdomProcessFiles(this.baseDir, (node, fileName) => this.recursiveBuildTemplateHookMap(node.children, fileName, map));
        return map;
    }


    recursiveBuildTemplateHookMap(elements, fileName, map, key = null) {
        let hook, hookSet;
        for (let element of elements) {
            key = key || Object.values(element.classList).find(c => c.match(this.templateRegex));
            if (key) {
                hookSet = (map[key] && map[key].hooks) || (map[key] = { hooks: {}, fileName: fileName });
                hook = Object.values(element.classList).find(c => c.match(this.hookRegex));
                if (hook) {
                    hookSet[hook] = true;
                }
                this.recursiveBuildTemplateHookMap(element.children, null, map, key);
            }
        }
    }

    recursiveFindGreatestIndex(elements, indexWrapper) {
        for (let element of elements) {
            Object.values(element.classList).forEach(c => {
                const match = c.match(this.hookRegex);
                indexWrapper.value = match && parseInt(match[1], 10) > indexWrapper.value ? parseInt(match[1], 10) : indexWrapper.value;
            });
            this.recursiveFindGreatestIndex(element.children, indexWrapper);
        }
    }

    recursiveAddClass(elements, level = 0) {
        let found, prefix, regex;
        for (let element of elements) {
            // console.log(element.tagName);
            regex = level === 0 ? this.templateRegex : this.hookRegex;
            prefix = level === 0 ? this.templatePrefix : this.hookPrefix;

            found = Object.values(element.classList).find(c => c.match(regex));
            if (!found) {
                element.classList.add(prefix + this.counter());
            }

            this.recursiveAddClass(element.children, level + 1);
        }
    }

    recursiveRemoveClass(elements, whiteList) {
        let found;
        for (let element of elements) {
            found = Object.values(element.classList).find(c => c.match(this.hookRegex) || c.match(this.templateRegex));
            if (found && !whiteList[found]) {
                element.classList.remove(found);
                if (element.classList.length === 0) {
                    element.removeAttribute("class");
                }
            }
            this.recursiveRemoveClass(element.children, whiteList);
        }
    }

}


module.exports = HtmlClassCrawler;
