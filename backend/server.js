
require("dotenv").config();

const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Authenticate Socket.IO connections using the existing JWT.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id;

    if (!userId) {
      return next(new Error("Invalid authentication token"));
    }

    socket.userId = userId.toString();
    next();
  } catch (error) {
    next(new Error("Socket authentication failed"));
  }
});

// Each user joins their own private notification room.
io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);

  console.log(`Socket connected for user: ${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected for user: ${socket.userId}`);
  });
});

// Make Socket.IO available to Express controllers.
app.set("io", io);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`TaskMatrix server running on port ${PORT}`);
      console.log("Socket.IO notification service is ready");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
