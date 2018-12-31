const utils = require('./utils');
const AWS = require('aws-sdk');

const profile = process.env['AWS_PROFILE'] ? process.env['AWS_PROFILE'] : 'default';
const credentials = new AWS.SharedIniFileCredentials({profile});
AWS.config.credentials = credentials;
if (process.env['AWS_REGION']){
    AWS.config.update({'region': process.env['AWS_REGION']});
}

exports.fn = async function(src) {
    const reqBody = JSON.stringify(src, null, 2);
    const functionName = process.env['FN'] ? process.env['FN'] : 'pankajk-awslt-square4-dev-square4';
    const resBody = await invokeLambda(functionName, {body: reqBody});
    const result = JSON.parse(resBody);
    return result;
}

async function invokeLambda(functionName, event) {
    return new Promise((resolve, reject) => {
        const lambda = new AWS.Lambda();
        const params = {
            FunctionName: functionName,
            Payload: JSON.stringify(event)
        };
        lambda.invoke(params, function(err, data) {
            if (err) {
                reject(err); // an error occurred
            } else {
                if (data.FunctionError) {
                    reject(JSON.parse(data.Payload));
                } else {
                    resolve(JSON.parse(data.Payload).body);  // successful response
                }
            }
        });
    })
};

exports.validate = utils.validateSquaredCopy;