const BaseHtmlCrawler = require('./baseHtmlCrawler');
const utils = require("./utils");


class HtmlAttributeCrawler extends BaseHtmlCrawler {

    constructor(baseDir, hookPrefix, templatePrefix) {
        super(baseDir, hookPrefix, templatePrefix);
    }

    async getTemplateHookMap() {
        utils.abstractMethodError();
    }

    async nextIndex() {
        utils.abstractMethodError();
    }

    async injectHooks() {
        utils.abstractMethodError();
    }

    async removeHooks() {
        utils.abstractMethodError();
    }

}



module.exports = HtmlAttributeCrawler;
