const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", ({ competitionId, teamId }) => {
      socket.join(competitionId);
      console.log(`Socket ${socket.id} joined room ${competitionId} (Team: ${teamId})`);
    });

    socket.on("admin-join", (competitionId) => {
      socket.join(`${competitionId}-admin`);
      console.log(`Admin joined room ${competitionId}-admin`);
    });

    socket.on("team-joined", ({ competitionId, team }) => {
      io.to(`${competitionId}-admin`).emit("team-joined", team);
      io.to(competitionId).emit("lobby-update");
    });

    socket.on("competition-start", (competitionId) => {
      io.to(competitionId).emit("competition-start");
    });

    socket.on("competition-pause", (competitionId) => {
      io.to(competitionId).emit("competition-pause");
    });

    socket.on("competition-resume", (competitionId) => {
      io.to(competitionId).emit("competition-resume");
    });

    socket.on("competition-end", (competitionId) => {
      io.to(competitionId).emit("competition-end");
    });

    socket.on("round-unlock", ({ competitionId, teamId, roundId }) => {
      io.to(competitionId).emit("round-unlock", { teamId, roundId });
    });

    socket.on("submission", ({ competitionId, teamId }) => {
      io.to(`${competitionId}-admin`).emit("submission-received", { teamId });
    });

    socket.on("leaderboard-update", (competitionId) => {
      io.to(`${competitionId}-admin`).emit("leaderboard-update");
    });

    socket.on("timer-sync", ({ competitionId, remainingTime }) => {
      io.to(competitionId).emit("timer-sync", { remainingTime });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
