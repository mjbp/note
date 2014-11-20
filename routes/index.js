var express = require('express'),
	router = express.Router(),
	shortId = require('shortid');


//No note id
router.get('/', function(req, res) {
	var id = shortId.generate(),
		db = req.db;
	
	db.collection('note').insert({hash: id}, function(err, result) {
			if (err) throw err;
			if (result) console.log('Added');
		});
	
  	res.redirect('/' + id);
});


//Find note
router.get('/:uid', function(req, res) {
	var db = req.db;
    db.collection('note').findOne({ hash: req.params.uid }, function(err, result) {
		if (err) { throw err; }
		if (!result) { res.redirect('/'); }
		else {
			res.render('index', { title: 'Note', content: result.content});
		}
    });
  	
});


module.exports = router;
