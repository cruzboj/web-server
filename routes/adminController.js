const pool = require("../pool");

function getTickets(req, res) { // Get all tickets
  pool.query("select * from admintickets").then((response) => {
    if (response.rows.length == 0) {
      return res.status(401).send("No Tickets");
    }
    res.status(200).json(response.rows);
  });
}

function postTicket(req, res) {
  const username = req.body.username;
  const description = req.body.description;

  findUser(username).then((user) => {
    if (!user) {
      return res.status(503).send(`Invalid username: ${username}`);
    }
    const query = `insert into admintickets (username,description) values ($1,$2)`;
    pool
      .query(query, [username, description])
      .then((response) => {
        return res.status(200).send("Ticket Posted Succesfully");
      })
      .catch((error) => {
        console.error("Error creating ticket: ", error);
        return res.status(500).send("Error Creating ticket");
      });
  });
}

function changeTicketStatus(req, res) {
  const id = req.body.id;
  const afterStatus = req.body.changeStatus;
  findTicketByID(id).then((ticket) => {
    if (!ticket) {
      return res.status(503).send(`No ticket found with id ${id}`);
    }
    query = `update admintickets set status = $1,lastupdatedat = current_timestamp where ticketid = $2`;
    pool.query(query, [afterStatus, id]).then((response) => {
      if (response.rowCount === 0) {
        return res.status(404).send("Error updating");
      }
      return res.status(200).send("Ticket updated Succesfully");
    });
  });
}

function getTicketRequest(req,res){
  const ticketID = req.params.ticketid;
  findTicketByID(ticketID).then((response) => {
    res.status(200).send(response);
  })
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

function findUser(username) {
  const query = "select * from users where username = $1";
  return pool
    .query(query, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    })
    .catch((error) => {
      console.error(`Error finding user ${username} `, error);
      return null;
    });
}

module.exports = {
  getTickets,
  changeTicketStatus,
  postTicket,
  getTicketRequest
};
