const socketio = require("socket.io");
const {
  addUserToRoom,
  getUsersInRoom,
  getUserBySocket,
  removeUserFromRoom,
  addMessage,
} = require("./util/sockets");

const createSocketServer = (server) => {
  const io = socketio(server);

  io.on("connection", (socket) => {
    console.log(`New socket connection --> ${socket.id}`);

    socket.on("joinRoom", async (data) => {
      try {
        const { username, room } = await addUserToRoom({
          socketId: socket.id,
          ...data,
        });

        socket.join(room);

        const message = {
          sender: "Admin",
          text: `${username} joined`,
          createdAt: new Date(),
        };

        socket.broadcast.to(room).emit("message", message);
        const roomMembers = await getUsersInRoom(room);

        io.to(room).emit("roomData", { room, users: roomMembers });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("message", async ({ room, message }) => {
      try {
        const user = await getUserBySocket(room, socket.id);
        if (user) {
          const messageContent = {
            text: message,
            sender: user.username,
            room,
          };
          await addMessage(messageContent.sender, room, messageContent.text);
          io.to(room).emit("message", messageContent);
        } else {
          console.log("user not found, rejoin");
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("leaveRoom", async ({ room }) => {
      try {
        const user = await removeUserFromRoom(socket.id, room);

        const messageToRoomMembers = {
          sender: "Admin",
          text: `${user.username} has left`,
          createdAt: new Date(),
        };
        io.to(room).emit("message", messageToRoomMembers);
        const roomMembers = await getUsersInRoom(room);
        io.to(room).emit("roomData", { room, users: roomMembers });
      } catch (error) {
        console.log(error);
      }
    });
  });
};

module.exports = createSocketServer;
