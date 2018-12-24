exports.fn = async function(src) {
    const reqBody = JSON.stringify(src, null, 2);
    const proto = process.env['PROTO'] ? process.env['PROTO'] : 'http';
    const host = process.env['HOST'] ? process.env['HOST'] : 'localhost';
    const port = process.env['POST'] ? process.env['PORT'] : (proto === 'http' ? 80 : 443);
    const resBody = await post(`${proto}://${host}:${port}/square4`, reqBody);
    const result = JSON.parse(resBody);
    return result;
}

async function post(url, body) {
    return new Promise((resolve, reject) => {
        const protoPrefix = url.startsWith('https://') ? 'https://' : 'http://';
        const slashIndex = url.indexOf('/', protoPrefix.length);
        let hostname = slashIndex === -1 ? url.slice(protoPrefix.length) : url.slice(protoPrefix.length, slashIndex);
        const colonIndex = hostname.indexOf(':');
        const port = colonIndex !== -1 ? Number(hostname.slice(colonIndex+1)) : 80;
        hostname = colonIndex !== -1 ? hostname.slice(0, colonIndex) : hostname;
        const path = slashIndex === -1 ? '/' : url.slice(slashIndex);
        const lib = protoPrefix === 'https://' ? require('https') : require('http');
        const options = { 
            hostname, port, path, method: 'POST',
            rejectUnauthorized: false,
            headers: { 'content-type': 'application/json' }
        };

        const request = lib.request(options, (response) => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Request failed, status code: ' + response.statusCode));
            }
            const body = [];
            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => resolve(body.join('')));
        });
        request.write(body);
        request.end();
        request.on('error', (err) => reject(err));
    })
};

exports.validate = function(arr1, arr2) {
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