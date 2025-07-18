const utils = require("./utils");

class BaseHtmlCrawler {

    constructor(baseDir, hookPrefix, templatePrefix) {
        this.baseDir = baseDir;
        this.hookPrefix = hookPrefix;
        this.templatePrefix = templatePrefix;
        this.hookRegex = new RegExp("^" + hookPrefix + "(\\d+)$");
        this.templateRegex = new RegExp("^" + templatePrefix + "(\\d+)$");
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

module.exports = BaseHtmlCrawler;
