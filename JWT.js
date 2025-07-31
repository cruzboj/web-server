const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader;
    if (!token) {
        return res.status(401).send("Invalid Token");
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send("Invalid Token");
        }
        req.user = user;
        next();
    });
}

function authenticateAdmin(req,res,next){
    const authHeader = req.headers["authorization"];
    if (!authHeader){
        return res.status(401).send("No Token");
    }
    jwt.verify(authHeader,SECRET_KEY,(err,decoded) => {
        if (err){
            return res.status(403).json({"error":"Invalid Token"});
        }
        if(!decoded.isAdmin){
            return res.status(403).json({"error":"User is not an admin"});
        }
        req.user = decoded;
        next();
    })
}

function getUserID(token){
    const decoded = jwt.verify(token,SECRET_KEY);
    const userId = decoded.id;
    return userId;
}

module.exports = {
    authenticateToken,
    authenticateAdmin,
    getUserID
}