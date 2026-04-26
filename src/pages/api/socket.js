import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

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
  }
  res.end();
}
