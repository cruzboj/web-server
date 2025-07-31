const pool = require("../pool");

function getTickets(req, res) {
  pool
    .query("select * from admintickets order by ticketid")
    .then((response) => {
      if (response.rows.length == 0) {
        return res.status(401).send("No Tickets");
      }
      res.status(200).json(response.rows);
    })
    .catch((err) => {
      console.log("error getting all tickets", err);
      return res.status(500).json({"error":"Internal Server Error"});
    });
}

function postTicket(req, res) {
  const username = req.body.username;
  const description = req.body.description;

  findUser(username).then((user) => {
    if (!user) {
      return res.status(503).send(`Invalid username: ${username}`);
    }
    const query = `insert into admintickets (username,description,status) values ($1,$2,'Open')`;
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

function getTicketRequest(req, res) {
  const ticketID = req.params.ticketid;
  findTicketByID(ticketID).then((response) => {
    if (response == null) {
      return res.status(404).json({"error":"missing Ticket"});
    }
    res.status(200).send(response);
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
      return res.status(500).json({"error":"Internal Server Error"})
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

async function updateTicket(req, res) {
  const ticketID = req.body.ticketid;
  const NewDate = new Date();
  const adminResponse = req.body.adminResponse;
  const newStatus = req.body.status;
  if (!ticketID || !NewDate || !adminResponse || !newStatus){
    return res.status(401).json({"error":"missing Parameters"});
  }
  const checkTicket = await pool.query("select * from admintickets where ticketid = $1",[ticketID]);
  if(checkTicket.rows.length !== 1) {
    return res.status(404).json({"error":"Ticket not found"});
  }
  const query =
    "update admintickets set response = $1, lastupdatedat = $2,status = $3 where ticketid = $4";
  pool
    .query(query, [adminResponse, NewDate, newStatus, ticketID])
    .then((response) => {
      return res.status(200).json({ status: "ticket updated" });
    })
    .catch((err) => {
      console.log("error updating ticket", err);
      return res.status(500).json({ error: "error updating ticket" });
    });
}

module.exports = {
  getTickets,
  postTicket,
  getTicketRequest,
  updateTicket,
};
