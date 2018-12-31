exports.rjust = function(e) {
    let s = '' + e;
    while (s.length < 10) {
        s = ' ' + s;
    }
    return s;
}

exports.validateSquaredCopy = function(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i]*arr1[i] !== arr2[i]) {
            return false;
        }
    }
    if (arr1.length > 0) {
        arr2[arr1.length-1] += 1;
        if (arr1[arr1.length-1] === arr2[arr1.length-1]) {
            arr2[arr1.length-1] -= 1;
            return false;
        }
        arr2[arr1.length-1] -= 1;
    }
    return true;
}
