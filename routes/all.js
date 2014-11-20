var express = require('express');
var router = express.Router();

/* GET notelist */
router.get('/', function(req, res) {
	console.log('all');
    var db = req.db;
    db.collection('note').find().toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;
