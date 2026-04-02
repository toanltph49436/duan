const express = require('express');
const { AddTransport, DeleteTransport, GetTransportAll, GetTransportById, UpdateTransport } = require('../../controller/TransportController/TransportControllers.js');

const TransportRouter = express.Router();
TransportRouter.get('/transport', GetTransportAll)
TransportRouter.post('/transport', AddTransport)
TransportRouter.put('/transport/:id', UpdateTransport)
TransportRouter.get('/transport/:id', GetTransportById)
TransportRouter.delete('/transport/:id', DeleteTransport)

module.exports = TransportRouter