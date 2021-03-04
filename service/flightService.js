const { Op } = require("sequelize");
const { Flight, FlightRaw } = require("@utopia-airlines-wss/common/models");
const { NotFoundError, handleMutationError, BadRequestError } = require("@utopia-airlines-wss/common/errors");
const { removeUndefined } = require("@utopia-airlines-wss/common/util");
const { Route } = require("@utopia-airlines-wss/common/models/Route");


const getDateRange = date => {
  const startTime = new Date(date.getTime());
  startTime.setHours(0, 0, 0, 0);
  const endTime = new Date(startTime.getTime());
  endTime.setDate(endTime.getDate() + 1);
  return [startTime, endTime];
};


const flightService = {
  async findAllFlights(
    {
      origin, destination, departureDate, sort, order = "ASC"
    } = {}, { offset = 0, limit = 10 }) {
    //order: ADC, DESC
    //sort: seatPrice, departureTime
    if (limit > 10000)
      throw new BadRequestError("Limit exceeds maximum of 10000");
    const { count, rows } = await Flight.findAndCountAll({
      where: {
        ...removeUndefined({
          departureTime: departureDate ? { [Op.between]: getDateRange(new Date(departureDate)), } : null,
        }),
        [Op.and]: (origin || destination) ? [
          [
            origin ?
              {
                [Op.or]: [
                  { "$route.origin_id$": { [Op.substring]: origin }, },
                  { "$route.origin.name$": { [Op.substring]: origin }, },
                  { "$route.origin.city$": { [Op.substring]: origin }, },
                  { "$route.origin.country$": { [Op.substring]: origin }, },
                ]
              } : null,
            destination ?
              {
                [Op.or]: [
                  { "$route.destination_id$": { [Op.substring]: destination }, },
                  { "$route.destination.name$": { [Op.substring]: destination }, },
                  { "$route.destination.city$": { [Op.substring]: destination }, },
                  { "$route.destination.country$": { [Op.substring]: destination }, }
                ]
              } : null
          ]
        ] : [],
      },
      offset: +offset,
      limit: +limit,
      order: (sort) ? [[sort, order]] : null,
      include: [
        {
          // model: Route,
          // as: "route",
          association: "route",
          // where: removeUndefined({
          //   originId: origin && {
          //     [Op.substring]: origin,
          //   },
          //   destinationId: destination && {
          //     [Op.substring]: destination,
          //   },
          // }),
          include: [
            {
              association: "origin",
              // where: removeUndefined({
              //   city: originCity && {
              //     [Op.substring]: originCity,
              //   },
              //   country: originCountry && {
              //     [Op.substring]: originCountry,
              //   }
              // }),
            },
            {
              association: "destination",
              // where: removeUndefined({
              //   city: destinationCity && {
              //     [Op.substring]: destinationCity,
              //   },
              //   country: destinationCountry && {
              //     [Op.substring]: destinationCountry,
              //   }
              // }),
            },
          ]
        },
        "airplane",
      ],
    });
    return {
      total: count,
      offset,
      count: rows.length,
      results: rows,
    };
  },
  async findFlightById(id) {
    const flight = await Flight.findByPk(id,
      {
        include: [
          "route",
          "airplane",
        ],
      });
    if (!flight) throw new NotFoundError("cannot find flight");
    return flight;
  },
  async createFlight({ routeId, airplaneId, departureTime, seats: { reserved, price } = {} } = {}) {
    try {
      return await FlightRaw.create({
        routeId,
        airplaneId,
        departureTime,
        reservedSeats: reserved,
        seatPrice: price,
      });
    } catch (err) {
      handleMutationError(err);
    }
  },
  async updateFlight(id, { routeId, airplaneId, departureTime, seats: { reserved, price } = {} } = {}) {
    const flight = await flightService.findFlightById(id);
    if (!flight) throw new NotFoundError("cannot find flight");
    try {
      const newFlightInfo = {
        routeId,
        airplaneId,
        departureTime,
        reservedSeats: reserved,
        seatPrice: price,
      };
      flight.update(newFlightInfo);
    } catch (err) {
      handleMutationError(err);
    }
  },
  async deleteFlight(id) {
    const flight = await Flight.findByPk(id);
    if (!flight) throw new NotFoundError("cannot find flight");
    await flight.destroy();
  },
};

module.exports = flightService;
