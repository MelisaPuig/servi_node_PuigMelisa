const dotenv = require("dotenv").config();
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const getEnvironmentVariableOrError = (environmentVarName) => {
  const environmentVariable = process.env[environmentVarName];
  if (
    typeof environmentVariable === "undefined" ||
    environmentVariable === ""
  ) {
    throw new Error(
      `No se ha establecido la variable de entorno "${environmentVarName}".`
    );
  }
  return environmentVariable;
};

const getCliArgOrDefault = (argName, defaultValue) => {
  const argumentValue = argv[argName];
  if (typeof argumentValue === "undefined") {
    console.log(
      `No se estableció el valor del argumento "${argName}". Usando por defecto "${defaultValue}".`
    );
    return defaultValue;
  }
  return argumentValue;
};

module.exports = {
  IS_CLUSTER: process.argv[2] === "CLUSTER",
  MONGO_URL: getEnvironmentVariableOrError("MONGO_URL"),
  SESSION_SECRET: getEnvironmentVariableOrError("SESSION_SECRET"),
  PORT: getCliArgOrDefault("port", 8080),
};
