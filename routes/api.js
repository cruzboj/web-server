const pool = require("../pool");
const express = require("express");


function getNews(req, res) {
    pool.query(`
    select * from news
    `).then(response => {
        res.status(200).json(response.rows);
    })
        .catch(err => {
            console.error(err)
            res.status(500).send("DB Error");
        })
}

function helloWorld(req, res) {
    res.send("Hello World!");
}

function test(req, res) {
    res.json({ message: "Test!" });
}

function getDB(req, res) {
    pool
        .query("select * from packtest;")
        .then((response) => {
            res.status(200).send(response.rows);
        })
        .catch((error) => {
            res.status(500).send("DB Error " + error);
        });
}
function postDB(req, res) {
    console.log(req.body);
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const insertQuery = `
    INSERT INTO users (username, password, email)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

    pool
        .query(insertQuery, [username, password, email])
        .then((response) => {
            res.status(201).json(response.rows[0]);
        })
        .catch((err) => {
            console.error("Insert error:", err);
            res.status(500).json({ error: "Insert failed", details: err });
        });
}

function postNews(req, res) {
    const { title, description, color } = req.body;
    const imgPath = "/image/news/" + req.file.filename;

    pool
        .query(
            `
    INSERT INTO news (title,description,img_path,color) values ($1,$2,$3,$4)`,
            [title, description, imgPath, color]
        )
        .then(() => {
            res.status(200).send("News added!");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error Inserting");
        });
}

module.exports = {
    getNews,
    helloWorld,
    test,
    getDB,
    postDB,
    postNews,

};