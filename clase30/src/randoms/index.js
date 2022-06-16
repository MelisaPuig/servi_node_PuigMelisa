const { fork } = require("child_process");
const path = require("path");

const CHILD_PROCESS_PATH = path.join(__dirname, "childProcess.js");

class Randoms {
  constructor() {
    this.generateRandomNumbers = this.generateRandomNumbers.bind(this);
  }

  async generateRandomNumbers(numberCount) {
    /**
     * Hice más de un forkeo para poder hacer más de un request a la vez.
     * Si mientras pedís 500.000.000, pedís otro de 20, no se bloquean mutuamente.
     */
    return new Promise((resolve, reject) => {
      try {
        const forkedProcess = fork(CHILD_PROCESS_PATH);
        forkedProcess.on("error", (error) => {
          reject(error);
          return;
        });
        forkedProcess.send({ numberCount });
        forkedProcess.on("message", (messageData) => {
          resolve(messageData.numbersDictionary);
          forkedProcess.kill();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new Randoms();
