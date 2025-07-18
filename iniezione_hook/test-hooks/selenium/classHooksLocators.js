
//*[contains(@class, 'x-test-hook-36')]//*[contains(@class, 'x-test-hook-37') and contains(text(),'val')]

console.log("Selenium: class-hooks-locators.js loaded.")

const hookPrefix = 'x-test-hook-';
const templatePrefix = 'x-test-tpl-';
const hookRegex = new RegExp(`^(?:(?:${hookPrefix})|(?:${templatePrefix}))\\d+$`);


function myLocatorBuilder(builder) {

    return (elem) => {

        let locator = null;

        let templateRootParent = false;

        while (elem !== document) {

            let className = getHookClass(elem);
            if (!className) {
                throw new Error('Cannot find hook for element', elem)
            }
            const templateRoot = className.indexOf(templatePrefix) >= 0;

            const siblings = getAllSiblings(elem, classFilter(className));

            const index = siblings.length > 1 ? siblings.indexOf(elem) + 1 : 0;

            if (!locator || siblings.length > 1 || templateRoot || templateRootParent) { //first loop (target element) or more siblings found
                locator = builder.elementLocator(className, index) + (locator || '');
                templateRootParent = !!templateRoot;
            }

            elem = elem.parentNode;
        }
        //console.log('locator', locator);
        return builder.prefix + locator;
    }
}


const cssBuilders = {
    elementLocator: (className, index) => {
        return '.' + className + (index > 0 ? ':nth-of-type(' + index + ')' : '') + ' ';
    },
    prefix: 'css='
}

const xpathBuilders = {
    elementLocator: (className, index) => {
        return `//*[contains(@class, '${className}')]` + (index > 0 ? `[${index}]` : '');
    },
    prefix: ''
}

LocatorBuilders.add('myCss', myLocatorBuilder(cssBuilders));
LocatorBuilders.add('myXPath', myLocatorBuilder(xpathBuilders));

LocatorBuilders.setPreferredOrder(['myXPath', 'myCss']);

function getHookClass(elem) {
    let className = null;
    for (var i = 0, l = elem.classList.length; i < l; ++i) {
        let match = elem.classList[i].match(hookRegex);
        if (match) {
            className = match[0];
            break;
        }
    }
    return className;
}

// get all sibilings and filter
function getAllSiblings(elem, filter) {
    var siblings = [];
    elem = elem.parentNode.firstChild;
    do {
        if (elem.nodeType === 1) {
            if (!filter || filter(elem)) {
                siblings.push(elem);
            }
        }
    } while ((elem = elem.nextSibling))
    return siblings;
}

function classFilter(className) {
    return e => e.classList.contains(className);
}
