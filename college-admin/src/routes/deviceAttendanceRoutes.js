const express = require("express");

const router = express.Router();

const controller = require("../controllers/attendaneFromDeviceControler");

router.use(
  "/iclock",
  express.text({
    type: ["text/plain", "text/*", "application/octet-stream"],
    limit: "5mb",
  }),
);

router.get("/iclock/cdata", controller.handleADMSData);

router.post("/iclock/cdata", controller.handleADMSData);

router.get("/iclock/getrequest", (req, res) => {
  res.type("text/plain").send("OK");
});

module.exports = router;
