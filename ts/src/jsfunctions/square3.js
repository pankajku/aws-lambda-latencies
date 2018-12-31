const utils = require('./utils');

exports.fn = function(src) {
    return src.map(e => e*e);
}

exports.validate = utils.validateSquaredCopy;
