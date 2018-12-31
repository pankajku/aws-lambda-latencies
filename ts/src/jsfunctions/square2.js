const utils = require('./utils');

exports.fn = function(src) {
    const result = src.slice(0);
    for (let i = 0; i < result.length; i++) {
        result[i] *= result[i]
    }
    return result;
}

exports.validate = utils.validateSquaredCopy;
