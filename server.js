const express = require("express");
const socket = require("socket.io");
const PORT = process.env.PORT || 4000;

// App setup
const app = express();
const server = app.listen(PORT, () => {
  console.log("listening for requests on port: ", PORT);
});

// save calculations so that all clients will have the latest calcs
let calculations = [];

// Static files
app.use(express.static("public"));

// Socket working on the server
const io = socket(server);

io.on("connection", (socket) => {
  // socket = socket making the connection and the server
  socket.on("calculation", function (data) {
    // io.socket refers to all sockets connected to the server
    calculations.unshift(data);
    if (calculations.length > 10) {
      calculations.pop();
    }

    io.sockets.emit("calculation", data);
  });

  socket.on("connected", function () {
    // once the client connects, send them the latest calulations from all clients
    io.sockets.emit("connected", calculations);
  });
});
