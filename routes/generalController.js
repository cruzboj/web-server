function helloWorld(req, res) {
    res.send("Hello World!");
}

function test(req, res) {
    res.json({ message: "Test!" });
}

module.exports = {
    helloWorld,
    test,
};