const pool = require("../pool");

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
function postNews(req, res) {
    const { title, description, color } = req.body;
    console.log(req.file);
    const imgPath = req.file.path;
    if (!title || !color || !description ||!imgPath){
        return res.status(401).json({"error":"Missing parameters"});
    }
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

async function deleteNews(req,res){
    const newsID = req.params.id
    const query = "delete from news where id = $1";
    let newsCheck = await pool.query("select * from news where id = $1");
    if (newsCheck.rows.length === 0){
        return res.status(404).json({"error":"news not found"})
    }
    pool.query(query,[newsID])
    .then((response) => {
        return res.status(200).json({"message":"News Deleted"});
    })
    .catch((err) => {
        console.log("Error deleting news:",err);
        return res.status(500).json({"error":"error deleting news"});
    })
}


module.exports = {
    getNews,
    postNews,
    deleteNews
}