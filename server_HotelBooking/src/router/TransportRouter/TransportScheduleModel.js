const express = require('express');
const { DelTransport, GetByIdTransport, GetTransport, PostTransport, PutTransport } = require('../../controller/TransportController/TransportScheduleModel.js');
const TransportSchedulemodel = express.Router();
TransportSchedulemodel.post('/transportSchedule', PostTransport)
TransportSchedulemodel.get('/transportSchedule', GetTransport)
TransportSchedulemodel.put('/transportSchedule/:id', PutTransport)
TransportSchedulemodel.delete('/transportSchedule/:id', DelTransport)
TransportSchedulemodel.get('/transportSchedule/:id', GetByIdTransport)

module.exports = TransportSchedulemodel