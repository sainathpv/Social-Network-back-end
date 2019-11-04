const http = require("http");
const kill = require("kill-port");
const app = require("./app");

const port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, ()=>{
    kill(port, "tcp");
});