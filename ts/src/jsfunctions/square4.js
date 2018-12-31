const utils = require('./utils');

exports.fn = function(src) {
    const s = JSON.stringify(src, null, 2);
    const result = JSON.parse(s);
    for (let i = 0; i < result.length; i++) {
        result[i] *= result[i]
    }
    return result;
}

exports.validate = utils.validateSquaredCopy;
