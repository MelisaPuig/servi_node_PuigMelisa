const os = require("os");

const get = () => {
  return {
    "Argumentos de entrada": JSON.stringify(process.argv),
    "Sistema operativo": process.platform,
    "Versión de NodeJs": process.version,
    "Memoria total reservada": process.memoryUsage().rss,
    "Path de ejecución": process.execPath,
    "Process id": process.pid,
    "Carpeta del proyeto": process.cwd(),
    "Cantidad de procesadores": os.cpus().length,
  };
};

module.exports = { get };
