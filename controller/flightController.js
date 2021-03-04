const { sendJson } = require("@utopia-airlines-wss/common/util");

const { flightService } = require("../service");

const flightController = {
  async getAll(req, res, next) {
    try{
      const { offset, limit, ...query } = req.query;
      const flights = await flightService.findAllFlights(query, { offset, limit });
      sendJson({
        req,
        res,
        data: flights,
      });
    } catch(err){
      next(err);
    }
  },
  async getById(req, res, next){
    try{
      const flight = await flightService.findFlightById(req.params.id);
      sendJson({
        req,
        res,
        data: flight,
      });
    } catch(err){
      next(err);
    }
  },
  async create(req, res, next) {
    try{
      const flight = await flightService.createFlight(req.body);
      res.status(201).json(flight);
    } catch(err){
      next(err);
    }
  },
  async updateById(req, res, next) {
    try {
      res.json(await flightService.updateFlight(req.params.id, req.body));
    } catch(err) {
      next(err);
    }
  },
  async deleteById(req, res, next) {
    try {
      await flightService.deleteFlight(req.params.id);
      res.sendStatus(204);
    } catch(err) {
      next(err);
    }
  },
};

module.exports = { flightController };