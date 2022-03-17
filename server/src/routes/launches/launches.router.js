const router = require("express").Router();
const { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch } = require("./launches.controller");

router.get("/", httpGetAllLaunches);
router.post("/", httpAddNewLaunch);
router.delete("/:id", httpAbortLaunch);

module.exports = router;