const http = require('http');

const server = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'application/json');


    if (req.method === 'GET' && req.url === '/user') {
        const user = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com'
        };

        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'User details fetched successfully',
            data: user
        }));
    }

    else if (req.method === 'POST' && req.url === '/user') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const userData = JSON.parse(body);

            res.writeHead(201);
            res.end(JSON.stringify({
                message: 'User created successfully',
                data: userData
            }));
        });
    }

});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});