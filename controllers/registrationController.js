const db = require("../database/db");

exports.registerUser = (req, res) => {
  const { userName, eventId } = req.body;

  if (!userName || !eventId) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  db.get(
    `
    SELECT *
    FROM registrations
    WHERE user_name = ?
    AND event_id = ?
    AND status = 'ACTIVE'
    `,
    [userName, eventId],
    (err, registration) => {
      if (registration) {
        return res.status(400).json({
          message: "User already registered"
        });
      }

      db.get(
        `SELECT * FROM events WHERE id = ?`,
        [eventId],
        (err, event) => {
          if (!event) {
            return res.status(404).json({
              message: "Event not found"
            });
          }

          if (event.available_seats <= 0) {
            return res.status(400).json({
              message: "Event is full"
            });
          }

          db.run(
            `
            INSERT INTO registrations
            (user_name,event_id)
            VALUES(?,?)
            `,
            [userName, eventId],
            function (err) {
              if (err) {
                return res.status(500).json({
                  message: err.message
                });
              }

              db.run(
                `
                UPDATE events
                SET available_seats = available_seats - 1
                WHERE id = ?
                `,
                [eventId]
              );

              res.status(201).json({
                message: "Registration successful"
              });
            }
          );
        }
      );
    }
  );
};

exports.cancelRegistration = (req, res) => {
  const registrationId = req.params.id;

  db.get(
    `
    SELECT *
    FROM registrations
    WHERE id = ?
    `,
    [registrationId],
    (err, registration) => {
      if (!registration) {
        return res.status(404).json({
          message: "Registration not found"
        });
      }

      if (registration.status === "CANCELLED") {
        return res.status(400).json({
          message: "Already cancelled"
        });
      }

      db.run(
        `
        UPDATE registrations
        SET status = 'CANCELLED'
        WHERE id = ?
        `,
        [registrationId],
        (err) => {
          db.run(
            `
            UPDATE events
            SET available_seats = available_seats + 1
            WHERE id = ?
            `,
            [registration.event_id]
          );

          res.json({
            message: "Registration cancelled"
          });
        }
      );
    }
  );
};