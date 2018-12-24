const fs = require('fs');

let proto = 'http';
let port = 80;
let keyFile = 'server.key';
let crtFile = 'server.crt';

if (process.argv.length > 2) {
    let index = 2;
    while (index < process.argv.length) {
        switch (process.argv[index]) {
            case '-port':
                port = Number(process.argv[index+1]);
                break;
            case '-proto':
                proto = process.argv[index+1];
                break;
            case '-keyFile':
                keyFile = process.argv[index+1];
                break;
            case '-crtFile':
                crtFile = process.argv[index+1];
                break;
            default:
                console.log('Usage:: node server.js [-port <port>] [-proto {http|https}]');
                process.exit(0);
        }
        index += 2;
    }
}
const lib = proto === 'http' ? require('http') : require('https');

function square4(body) {
    const arr = JSON.parse(body);
    for (let i = 0; i < arr.length; i++) {
        arr[i] *= arr[i];
    }
    return JSON.stringify(arr, null, 2);
}

const handleRequest = (request, response) => {
    const url = request.url;
    const method = request.method;
    if (method !== 'POST') {
        response.writeHead(400);
        response.end(`HTTP Method Not Supported: ${method}`);
        return;
    }
    if (url === '/square4') {
        let body = '';
        request.on('data', data => body += data);
        request.on('end', () => {
            const result = square4(body);
            response.writeHead(200);
            response.end(result);
        });
    } else {
        response.writeHead(400);
        response.end(`Unknown URL: ${url}`);
    }
};

let www;
if (proto === 'https') {
    const options = {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(crtFile)
    };
    www = lib.createServer(options, handleRequest);
} else {
    www = lib.createServer(handleRequest);
}
www.listen(port);
console.log(`Listening for ${proto} connections on port ${port} ...`);
