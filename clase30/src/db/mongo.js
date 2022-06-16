const mongoose = require("mongoose");

class Mongo {
  async connect(mongoURL) {
    try {
      if (mongoose.STATES[mongoose.connection.readyState] === "connected") {
        return mongoose.connection.db;
      }
      const mongooseConfig = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        autoCreate: true,
      };
      await mongoose.connect(mongoURL, mongooseConfig);
      if (mongoose.STATES[mongoose.connection.readyState] !== "connected") {
        throw new Error("MongoDB isn't connected.");
      }
      return mongoose.connection.db;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Mongo();
