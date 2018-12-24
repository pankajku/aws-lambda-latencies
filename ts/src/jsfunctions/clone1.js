exports.fn = function(src) {
    let copy = [];
    for (let i = 0; i < src.length; i++) {
        copy.push(src[i]);
    }
    return copy;
}

exports.validate = function(arr1, arr2) {
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