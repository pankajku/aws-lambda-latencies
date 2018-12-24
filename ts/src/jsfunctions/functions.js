exports.clone1 = function(src) {
    let clone = [];
    for (let i = 0; i < src.length; i++) {
        clone.push(src[i]);
    }
    return clone;
}

exports.clone2 = function(src) {
    let clone = [];
    for (let i = 0; i < src.length; i++) {
        clone[i] = src[i];
    }
    return clone;
}

exports.clone3 = function(src) {
    let clone = new Array(src.length);
    for (let i = 0; i < src.length; i++) {
        clone[i] = src[i];
    }
    return clone;
}

exports.clone4 = function(src) {
    let clone = [];
    for (let e of src) {
        clone.push(e);
    }
    return clone;
}

exports.clone5 = function(src) {
    return src.map(e => e);
}

exports.clone6 = function(src) {
    return src.filter(e => true);
}

exports.clone7 = function(src) {
    return src.map(identity);
}

exports.clone8 = function(src) {
    return src.filter(success);
}

exports.clone9 = function(src) {
    return src.slice(0);
}

exports.noop = function(src) {
    return src;
}

exports.sort = function(src) {
    src.sort();
    return src;
}
exports.parse = function(s) {
    return JSON.parse(s);
}

exports.strfy = function(o) {
    return JSON.stringify(o, null, 2);
}

function identity(e) {
    return e;
}

function success(e) {
    return true;
}

exports.equal = function(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    if (arr1.length > 0) {
        arr2[arr1.length-1] += 1;
        if (arr1[arr1.length-1] === arr2[arr1.length-1]) {
            return false;
        }
    }
    return true;
}
