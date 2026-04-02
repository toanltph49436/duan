const express = require('express');
const { AddRoom, DeleteRoom, GetRoomById, RoomAll, UpdateRoom } = require('../../controller/Room/Room.js');

const RouterRoom = express.Router();
RouterRoom.get('/room', RoomAll);
RouterRoom.post('/room', AddRoom);
RouterRoom.delete('/room/:id', DeleteRoom);
RouterRoom.get('/room/:id', GetRoomById);
RouterRoom.put('/room/:id', UpdateRoom);
module.exports = RouterRoom