const { readFile, glob } = require("./utils");
const path = require("path");
const fs = require("fs");

exports.processFiles = processFiles;

async function processFiles(globExpr, grammar, processor, writeOutput = false) {
    const files = await glob(globExpr);
    let file, fileName, content, lines, root, tree, stream = process.stdout;

    for (file of files) {
        fileName = path.resolve(file);
        content = await readFile(fileName, 'utf-8');
        lines = grammar.tokenizeLines(content);
        root = groupTokens(iterableTokens(lines), [TAG_SCOPE, TAG_NAME_SCOPE, ATTRIBUTE_SCOPE, EMPTY_ATTRIBUTE_SCOPE]);
        tree = buildTagTree(root);
        processor(tree, fileName);
        if (writeOutput) { // TODO
            stream = fs.createWriteStream(fileName);
            stream.write(tree.toString());
            stream.end();
        }
    }

}


//testTree().catch(console.error);
async function testTree() {
    const grammars = require('../grammars'),
        grammar = await grammars.get('twig'),
        fileName = path.resolve('../../frontend-twig/sample.twig'),
        content = await readFile(fileName, 'utf-8'),
        lines = grammar.tokenizeLines(content),
        root = groupTokens(iterableTokens(lines), [TAG_SCOPE, TAG_NAME_SCOPE, ATTRIBUTE_SCOPE, EMPTY_ATTRIBUTE_SCOPE]),
        tree = buildTagTree(root);

    printDetailedTree(tree.children);
}


function printTree(nodes, level = 0) {
    for (let node of nodes.filter(token => token instanceof TagTokenGroup)) {
        console.log('    '.repeat(level) + (node.name || ''), JSON.stringify(node.attributeNames || node));
        if (node.childNodes) {
            printTree(node.childNodes, level + 1);
        }
    }
}


function printDetailedTree(tokens, prevScopes = []) {
    for (let token of tokens) {
        const scopes = token.scopes;

        if (scopes) {
            const value = token.value ? JSON.stringify(token.value) : '';
            //console.log('    '.repeat(level) + (token.scopes + '\t') + JSON.stringify(token.value || token.scope));
            if ((token.value || '').trim()) { // remove this "if" to include spaces
                if (prevScopes.length < scopes.length) {
                    for (let i = prevScopes.length; i < scopes.length; i++) {
                        console.log('    '.repeat(i), scopes[i], i === scopes.length - 1 ? value : '');
                    }
                } else {
                    console.log('    '.repeat(scopes.length - 1), scopes[scopes.length - 1], value);
                }
            }
            prevScopes = scopes;
        }

        if (token.children) {
            printDetailedTree(token.children, prevScopes);
        }
    }
}


function buildTagTree(rootNode) {
    rootNode.childNodes = [];
    const stack = new Stack();
    stack.push(rootNode);
    for (let tag of rootNode.children.slice().reverse()) { // from the end: it's simpler to detect "unclosed" tags
        if (tag.end) {
            stack.push(tag);
        } else if (tag.start && stack.top.name === tag.name) { // we reached a leaf
            if (stack.top === rootNode) {
                throw new Error("Malformed HTML file.");
            }
            const closingTag = stack.pop();
            tag.childNodes = closingTag.childNodes.concat(closingTag.children);
            stack.top.childNodes.unshift(tag);
        } else { // unclosed && empty tags
            stack.top.childNodes.unshift(tag);
        }
    }
    return rootNode;
}

class Stack extends Array {

    get top() {
        return this.length > 0 ? this[this.length - 1] : undefined;
    }

}


function groupTokens(iterator, groups) {
    let stack = new Stack(),
        newGroup;

    stack.push({
        scopeGroup: undefined,
        tokenGroup: new BaseTokenGroup('root')
    });

    for (let token of iterator) {
        newGroup = findGroupStart(token.scopes, groups);

        if (newGroup) { // detected start of a group
            if (stack.top.scopeGroup && newGroup.regex.base.length <= stack.top.scopeGroup.regex.base.length) { // (sibling) group changed!
                stack.pop();
            }
            const prevTop = stack.top;
            stack.push({
                scopeGroup: newGroup,
                tokenGroup: new newGroup.ctor(newGroup.name, [token])
            });
            prevTop.tokenGroup.append(stack.top.tokenGroup)
        } else {
            if (!isWithinGroup(token.scopes, stack.top.scopeGroup)) { // group ended!
                stack.pop();
            }
            stack.top.tokenGroup.append(token);
        }

    }

    return stack[0].tokenGroup;
}

function isWithinGroup(targetScopes, group) {
    let result = true;
    if (group) {
        if (targetScopes.length < group.regex.base.length) { // group scope is more specific than current target scope
            result = false;
        } else {
            let groupMatchCount = 0;
            let groupScopes = group.regex.base;
            for (let i = 0; i < targetScopes.length && groupMatchCount < groupScopes.length; i++) {
                if (targetScopes[i].match(groupScopes[groupMatchCount])) {
                    groupMatchCount++;
                }
            }
            result = groupMatchCount === groupScopes.length;
        }
    }
    return result;
}

function findGroupStart(targetScopes, groups) {
    let matchCount = 0;
    let matchingGroup;
    for (let group of groups) {
        let groupMatchCount = 0;
        let groupScopes = group.regex.base.concat(group.regex.start);
        for (let i = 0; i < targetScopes.length && groupMatchCount < groupScopes.length; i++) {
            if (targetScopes[i].match(groupScopes[groupMatchCount])) {
                groupMatchCount++;
            }
        }
        if (groupMatchCount === groupScopes.length && groupMatchCount > matchCount) {
            matchCount = groupMatchCount;
            matchingGroup = group;
        }
    }
    return matchingGroup;
}


function iterableTokens(lines) {
    let l = 0,
        t = 0,
        done = false,
        value;

    function next() {
        if (t === lines[l].length) {
            let scopes = lines[l][t - 1].scopes.slice();
            l++ , t = 0;
            if (l < lines.length) {
                value = {
                    value: '\n',
                    scopes: scopes // lines[l][0].scopes // next line scope
                };
            } else {
                done = true, value = undefined;
            }
        } else {
            value = lines[l][t++];
        }
        return { done, value };
    }

    return {
        [Symbol.iterator]: () => ({ next }),
        //next: () => next().value,
        //current : () => value
    }
}

function tokensToString(tokens) {
    return tokens.map(t => t instanceof BaseTokenGroup ? t.toString() : t.value).join('');
}


class BaseTokenGroup {
    constructor(scope, children = []) {
        this.scope = scope;
        this.children = children;
    }

    toString() {
        return tokensToString(this.children);
    }

    append(child) {
        this.children.push(child);
    }
}
BaseTokenGroup.prototype.type = 'base';

class TagNameTokenGroup extends BaseTokenGroup {
    constructor(scope, children) {
        super(scope, children);
    }

    get name() {
        return this.children[0].value;
    }
}
TagNameTokenGroup.prototype.type = 'tag_name';

class AttributeTokenGroup extends BaseTokenGroup {
    constructor(scope, children) {
        super(scope, children);
    }

    get name() {
        return this.children[0].value;
    }

    static emptyAttribute(name) {
        return new AttributeTokenGroup(null, [new SyntheticToken(name)]);
    }
}
AttributeTokenGroup.prototype.type = 'attribute';

class TagTokenGroup extends BaseTokenGroup {
    constructor(scope, children) {
        super(scope, children);
        this.childNodes = [];
    }

    get start() {
        return !this.end;
    }

    get end() {
        return this.children[0].value === '</';
    }

    get name() {
        const token = this.children[1];
        return token instanceof TagNameTokenGroup && token.name; //hasTopScope(token, TAG_NAME_SCOPE) &&
    }

    get empty() {
        const token = this.children[this.children.length - 2];
        return token.value && token.value.match(/\s*\//); //!!(hasTopScope(token, TAG_SCOPE) &&
    }

    get attributeNames() {
        return this.children
            .filter(token => token instanceof AttributeTokenGroup)
            .map(token => token.name);
    }

    addEmptyAttribute(name) {
        if (this.attributeNames.find(t => t.name === name)) {
            throw new Error(`Attribute with name ${name} already found in tag ${this.name}`);
        }
        const pos = this.children.findIndex(c => !!(c.scopes && c.scopes.find(s => s.match(/\.tag\.end\.html$/))));
        this.children.splice(pos, 0, new SyntheticToken(' '), AttributeTokenGroup.emptyAttribute(name));
    }

    removeAttribute(name) {
        const pos = this.children.findIndex(t => t instanceof AttributeTokenGroup && t.name === name);
        if (pos >= 0) {
            const spaceToken = this.children[pos - 1];
            if (spaceToken.value && spaceToken.value.match(/\s+/)) { // remove one space char
                spaceToken.value = spaceToken.value.substring(0, spaceToken.value.length - 1);
            }
            this.children.splice(pos, 1);
        }
    }

    toJSON() {
        return {
            name: this.name,
            empty: this.empty,
            start: this.start,
            end: this.end,
            attributeNames: this.attributeNames,
            tokens: this.tokens
        }
    }

}
TagTokenGroup.prototype.type = 'tag';

class SyntheticToken {
    constructor(value, scope = []) {
        this.value = value;
        this.scope = scope;
    }
}


const TAG_SCOPE = {
    name: 'tag',
    ctor: TagTokenGroup,
    regex: {
        base: [/^text\.html.*?$/, /^meta\.tag.*?\.html$/],
        start: [/^punctuation\.definition\.tag\.begin\.html$/] // will be concat with base!
    }
}

const TAG_NAME_SCOPE = {
    name: 'tag_name',
    ctor: TagNameTokenGroup,
    regex: {
        base: TAG_SCOPE.regex.base.concat([/^entity\.name\.tag.*?\.html$/]),
        start: []
    }
}

const ATTRIBUTE_SCOPE = {
    name: 'attribute',
    ctor: AttributeTokenGroup,
    regex: {
        base: TAG_SCOPE.regex.base.concat([/^meta\.attribute-with-value.*?\.html$/]),
        start: [/^entity\.other\.attribute-name.*?\.html$/]
    }
}

const EMPTY_ATTRIBUTE_SCOPE = {
    name: 'empty_attribute',
    ctor: AttributeTokenGroup,
    regex: {
        base: TAG_SCOPE.regex.base.concat([/^meta\.attribute-without-value.*?\.html$/]),
        start: ATTRIBUTE_SCOPE.regex.start
    }
}
