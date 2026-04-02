const express = require('express');
const { DeleteUser, GetAllUser, GetByIdUser, LoginUser, PutUser, RegisterUser } = require('../../controller/PeopleController/UserControllers.js');

const UserRouter = express.Router();
UserRouter.post('/register', RegisterUser)
UserRouter.post('/login', LoginUser)
UserRouter.get('/user' , GetAllUser)
UserRouter.put('/user/:id', PutUser)
UserRouter.delete('/user/:id', DeleteUser)
UserRouter.get('/user/:id', GetByIdUser)

module.exports = UserRouter