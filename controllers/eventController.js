const db = require("../database/db");

exports.createEvent = (req, res) => {
  const { name, totalSeats, eventDate } = req.body;

  if (!name || !totalSeats || !eventDate) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  if (totalSeats <= 0) {
    return res.status(400).json({
      message: "Total seats must be greater than 0"
    });
  }

  if (new Date(eventDate) <= new Date()) {
    return res.status(400).json({
      message: "Event date must be in the future"
    });
  }

  const sql = `
    INSERT INTO events
    (name,total_seats,available_seats,event_date)
    VALUES(?,?,?,?)
  `;

  db.run(
    sql,
    [name, totalSeats, totalSeats, eventDate],
    function (err) {
      if (err) {
        return res.status(400).json({
          message: "Event name already exists"
        });
      }

      res.status(201).json({
        message: "Event created successfully",
        eventId: this.lastID
      });
    }
  );
};

exports.getEvents = (req, res) => {
  const upcoming = req.query.upcoming;

  let sql = `
    SELECT
      id,
      name,
      total_seats,
      available_seats,
      event_date,
      (total_seats - available_seats) AS total_registrations
    FROM events
  `;

  if (upcoming === "true") {
    sql += ` WHERE event_date > datetime('now') `;
  }

  sql += ` ORDER BY event_date ASC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json(rows);
  });
};