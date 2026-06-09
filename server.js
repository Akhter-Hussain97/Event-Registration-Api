const express = require("express");
const app = express();

require("./database/db");

const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

app.use(express.json());

app.use("/events", eventRoutes);
app.use("/registrations", registrationRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});