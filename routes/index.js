
/*
 * GET home page.
 */
var action = require('../public/javascripts/action.js');

exports.index = function(req, res){
  res.render('index', { title: 'Action! Framework' });
};

exports.es6 = function(req, res) {
	res.render('es6', { title: 'Action! Framework' });
};