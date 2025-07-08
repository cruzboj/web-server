const pool = require("../pool");

function getTickets(req, res) {
  pool.query("select * from admintickets").then((response) => {
    if (response.rows.length == 0) {
      return res.status(401).send("No Tickets");
    }
    res.status(200).json(response.rows[0]);
  });
}

function changeTicketStatus(req, res) {
  const id = req.body.id;
  const afterStatus = req.body.changeStatus;
  if (!findTicketByID(id)) {
    return res.status(503).send("No ticket found with this ID");
  }
  query = `update admintickets set status = $1,lastupdatedat = current_timestamp where ticketid = $2`;
  pool.query(query, [afterStatus,id]).then((response) => {
    if (response.rowCount === 0) {
      return res.status(404).send("Error updating");
    }
    return res.status(200).send("Ticket updated Succesfully");
  });
}

function findTicketByID(id) {
  const query = "select * from admintickets where ticketid = $1";
  return pool
    .query(query, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    })
    .catch((error) => {
      console.error(`DB error in findTicketByID: `, error);
      throw error;
    });
}

module.exports = {
  getTickets,
  changeTicketStatus,
};
