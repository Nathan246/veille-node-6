const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.static('public'));
/* on associe le moteur de vue au module «ejs» */
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient // le pilote MongoDB
const ObjectID = require('mongodb').ObjectID;
app.set('view engine', 'ejs'); // générateur de template
// Utilisation de bodyParser
app.use(bodyParser());

var db // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresse', (err, database) => {
 if (err) return console.log(err)
 db = database
// lancement du serveur Express sur le port 8081
 app.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})

app.get('/', function (req, res) {
 res.render('accueil.ejs');
})

app.get('/membres', function (req, res) {
   let cursor = db.collection('adresse').find().toArray(function(err, resultat){
 if (err) return console.log(err)
 // transfert du contenu vers la vue adresses.ejs (renders)
 // affiche le contenu de la BD
 res.render('adresses.ejs', {adresses: resultat})
 }) 
})

app.get('/formulaire', (req, res) => {
 console.log('la route get / = ' + req.url)
 res.sendFile(__dirname + "/public/html/forme.htm")
})
/*
app.get('/detruire/:telephone', (req, res) => {
	db.collection('adresse').findOneAndDelete( {'telephone': req.params.telephone} ,(err, resultat) => {
		if (err) return res.send(500, err)
			var cursor = db.collection('adresse').find().toArray(function(err, resultat){
		if (err) return console.log(err)
			res.render('adresses.ejs', {adresses: resultat})
		})
	}) 
})
*/
app.get('/detruire/:id', (req, res) => {
 var id = req.params.id 
// var critere = 'ObjectId("58bae3feaf5a674b240cfe53")'
// 58bae3feaf5a674b240cfe53
// var critere = ObjectID.createFromHexString(id)
var critere = ObjectID(req.params.id)
console.log(critere)

console.log(id)
 db.collection('adresse').findOneAndDelete({"_id": critere}, (err, resultat) => {

if (err) return console.log(err)
 res.redirect('/membres')  // redirige vers la route qui affiche la collection
 })
})

app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle
	let ordre = (req.params.ordre == 'asc' ? 1 : -1)
	let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){
		//ordre = -ordre
		//console.log(req.url.split("/")[3])
		console.log(ordre);
		res.render('adresses.ejs', {adresses: resultat, cle, ordre })
	})
})

app.post('/modifier', (req, res) => {
	console.log('req.body' + req.body)
 	if (req.body['_id'] != "") { 
		console.log('sauvegarde') 
		var oModif = {
			"_id": ObjectID(req.body['_id']), 
			nom: req.body.nom,
			prenom: req.body.prenom, 
			telephone: req.body.telephone,
			courriel: req.body.courriel
		}
		var util = require("util");
 		console.log('util = ' + util.inspect(oModif));
 	} else {
		console.log('insert')
		console.log(req.body)
		var oModif = {
			prenom: req.body.prenom, 
			nom: req.body.nom,
			telephone: req.body.telephone,
			courriel: req.body.courriel
		}
	}
	db.collection('adresse').save(oModif, (err, result) => {
	if (err) return console.log(err)
		console.log('sauvegarder dans la BD')
		res.redirect('/membres')
	})
})

/*app.post('/adresse', (req, res) => {
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 console.log('sauvegarder dans la BD')
 res.redirect('/membres')
 })

})*/