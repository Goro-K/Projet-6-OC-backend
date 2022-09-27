const http = require('http');
const app = require('./app')
const server = http.createServer(app)
const dotenv = require('dotenv')
dotenv.config()

const MY_PORT = process.env.PORT

app.set('port', MY_PORT);

server.listen(MY_PORT, () => console.log(`Listening on ${MY_PORT}`))