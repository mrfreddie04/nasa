const router = require("express").Router();
const { httpGetAllPlanets } = require("./planets.controller");

router.get("/", httpGetAllPlanets);

module.exports = router;