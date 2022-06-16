const randoms = require("../randoms");

const RANDOM_DEFAULT_COUNT = 100000000;

class APIRandoms {
  constructor() {
    this.get = this.get.bind(this);
  }

  async get(req, res, next) {
    try {
      const rawCount = req.query.cant;
      const parsedCount = Number.parseInt(rawCount, 10);
      const finalCount = Number.isNaN(parsedCount)
        ? RANDOM_DEFAULT_COUNT
        : parsedCount;
      const randomNumbers = await randoms.generateRandomNumbers(finalCount);
      res.send(randomNumbers);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = APIRandoms;
