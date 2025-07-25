const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader;
    if (!token) {
        console.log("1");
        return res.status(401).send("Invalid Token");
    }
    console.log(token); 
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log("2");
            return res.status(403).send("Invalid Token");
        }
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken
}