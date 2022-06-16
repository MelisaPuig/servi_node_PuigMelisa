const express = require("express");

const APIRandoms = require("../api/randoms");
const apiRandoms = new APIRandoms();
const routerRandoms = express.Router();

routerRandoms.use(express.json());

routerRandoms.get("/", apiRandoms.get);

routerRandoms.all("*", (req, res, next) => {
  const notFoundMethodError = new Error(`${req.url} no es una API válida.`);
  next(notFoundMethodError);
});

routerRandoms.use((error, req, res, next) => {
  console.error(error);
  res.send({ error: error.message });
});

module.exports = routerRandoms;
