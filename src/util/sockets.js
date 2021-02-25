const MessageModel = require("../services/messages/schema");
const RoomModel = require("../services/rooms/schema");

const addMessage = async (sender, room, message) => {
  try {
    const newMessage = new MessageModel({ text: message, sender, room });
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    console.log(error);
  }
};

const addUserToRoom = async ({ username, socketId, room }) => {
  try {
    const findRoom = await RoomModel.findOne({ name: room });
    if (findRoom) {
      const user = await RoomModel.findOne({
        name: room,
        "members.username": username,
      });
      if (user) {
        await RoomModel.findOneAndUpdate(
          { name: room, "members.username": username },
          { "members.$.socketId": socketId }
        );
      } else {
        const newRoom = await RoomModel.findOneAndUpdate(
          { name: room },
          { $addToSet: { members: { username, socketId } } }
        );
      }
      return { username, room };
    } else {
      const newRoom = new RoomModel({
        name: room,
        members: [{ username, socketId }],
      });
      await newRoom.save();
      return { username, room };
    }
  } catch (error) {
    console.log(error);
  }
};

const getUsersInRoom = async (room) => {
  try {
    const selectedRoom = await RoomModel.findOne({ name: room });
    return selectedRoom;
  } catch (error) {
    console.log(error);
  }
};

const getUserBySocket = async (roomName, socketId) => {
  try {
    const room = await RoomModel.findOne({ name: roomName });
    const user = room.members.find((user) => user.socketId === socketId);
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};

const removeUserFromRoom = async (socketId, roomName) => {
  try {
    const room = await RoomModel.findOne({ name: roomName });
    const username = room.members.find((user) => user.socketId === socketId);
    await RoomModel.findOneAndUpdate(
      { name: roomName },
      { $pull: { members: { socketId } } }
    );
    return username;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addUserToRoom,
  getUsersInRoom,
  getUserBySocket,
  removeUserFromRoom,
  addMessage,
};
