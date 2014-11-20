var express = require('express');
var router = express.Router();

//Add note
router.post('/:uid', function(req, res) {
    var db = req.db;
	db.collection('note').update({hash:req.params.uid}, {$set:req.body}, function(err, result) {
		if (err) {
			throw err;
		} else {
			res.status(200).send('OK');
		}
	});
});

module.exports = router;
