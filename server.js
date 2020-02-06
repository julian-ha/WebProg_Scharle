const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");

const database = require('./database');

const app = express();

app.use(express.static("public/"));
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());






//Arbeitszeiterfassung

//Arbeitszeit Startseite
app.get("/", async (req, res) => {
  //MYSQL Anfrage um die Firmennamen und die FirmenID's zu bekommen
  var sqlfirma = 'SELECT k.*, r.beschreibung FROM kunde k , rechnungformat r WHERE r.id = k.rechnung ORDER BY k.firmenname';
  var sqlprojekt = 'SELECT p.*, k.firmenname FROM projekt p, kunde k WHERE p.kunden_id = k.id ORDER BY p.projektname';
  var sqlmitarbeiter = 'SELECT * FROM mitarbeiter ORDER BY nachname, vorname';
  
  var result = await database.queryDB(sqlfirma);
  var projekt = await database.queryDB(sqlprojekt);
  var mitarbeiter = await database.queryDB(sqlmitarbeiter);
  
  res.render("index", {
    titel: "Startseite",
    firmennamen: result,
    projektnamen: projekt,
    mitarbeiter: mitarbeiter
  });
});

//Erfassung der Arbeitszeiten & Weiterleitung auf Arbeitszeit Startseite
app.post('/', async (req, res) =>{
  var sql = 'INSERT INTO arbeitszeit (projekt_id, mitarbeiter_id, datum, arbeitsbeginn, arbeitsende, pause, geleistete_Stunden, fahrtkosten, was_wurde_erledigt) Values (?,?,?,?,?,?,?,?,?)';
  var variables = [req.body.projekt, req.body.mitarbeiter, req.body.datum, req.body.abUNIX, req.body.aeUNIX, req.body.pause, req.body.arbeitszeit, req.body.fahrtkosten, req.body.erledigt];
  var arbeitszeit = await database.queryDB(sql, variables);
  res.redirect('/');
});


//http Request um Projekte zu bekommen.
app.post('/get_projekte/:id', async( req, res) =>{
  var sql = 'SELECT id, projektname FROM projekt WHERE kunden_id = ?';
  var variables = [req.params.id];
  var projekte = await database.queryDB(sql, variables);
  res.send(projekte);
});


//Arbeitszeiten Übersicht
app.get('/arbeitszeiten', async (req, res) =>{
  console.log('arbeitszeit');
  var sql = 'SELECT a.id, k.firmenname, p.projektname, m.vorname, m.nachname, a.geleistete_Stunden,a.was_wurde_erledigt AS erledigt, a.geleistete_Stunden *k.stundensatz AS kosten FROM arbeitszeit a, kunde k , projekt p, mitarbeiter m WHERE a.projekt_id =p.id AND m.id =a.mitarbeiter_id AND p.kunden_id = k.id';
  var arbeitszeiten = await database.queryDB(sql);
  res.render('arbeitszeiten/arbeitszeiten', {
    titel: "Arbeitszeiten Übersicht",
    data: arbeitszeiten
  })
});



//Rechnungserstellung

app.get('/rechnung/:id', async (req, res) =>{

  var sql = 'SELECT k.*, DATE_FORMAT(a.datum, "%d.%m.%Y") as datum, DATE_FORMAT(a.datum, "%m") AS month, DATE_FORMAT(a.datum, "%Y") AS year FROM arbeitszeit a, projekt p, kunde k WHERE a.projekt_id = p.id AND p.kunden_id = k.id AND a.id = ?';
  var variables = [req.params.id];
  var kundendaten = await database.queryDB(sql, variables);
  if(kundendaten.length == 0){
    res.status(404).send({error: `Kunden ID ${req.params.id} wurde nicht gefunden`});
  }
  
  if( kundendaten[0].rechnung == 1 ){
    //einzelne Rechnung
    var sqlRD = 'SELECT DATE_FORMAT(a.datum, "%d.%m.%Y") AS datum, a.was_wurde_erledigt, p.projektname,m.vorname, m.nachname, ROUND((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten),2) AS preis FROM kunde k, mitarbeiter m, arbeitszeit a, projekt p WHERE p.id = a.projekt_id AND a.mitarbeiter_id = m.id AND k.id = p.kunden_id AND a.id = ?';
    var sqlP = 'SELECT ROUND((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten),2) AS summe, ROUND (((k.stundensatz *a.geleistete_Stunden + 0.25 * a.fahrtkosten) * 0.19), 2) AS mehrwertsteuer, ROUND(((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten) /100 *119),2) AS gesamtpreis FROM kunde k, arbeitszeit a, projekt p WHERE a.projekt_id = p.id AND p.kunden_id = k.id AND a.id = ?';
    var variables = [req.params.id];
    var zeitraum = kundendaten[0].datum;
    
  }
  else{
    //Quartalsrechnung
    var months = database.getQuartalszeiten(kundendaten[0].month, kundendaten[0].year);
    var sqlRD = 'SELECT DATE_FORMAT(a.datum, "%d.%m.%Y") AS datum, a.was_wurde_erledigt, p.projektname, m.vorname, m.nachname, ROUND((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten),2) AS preis FROM kunde k, projekt p, arbeitszeit a, mitarbeiter m WHERE a.projekt_id = p.id AND p.kunden_id = k.id AND a.mitarbeiter_id = m.id AND a.datum BETWEEN ? AND ? AND k.id = ?';
    var sqlP = 'SELECT SUM(ROUND((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten),2)) AS summe, SUM(ROUND (((k.stundensatz *a.geleistete_Stunden + 0.25 * a.fahrtkosten) * 0.19), 2)) AS mehrwertsteuer, SUM(ROUND(((k.stundensatz * a.geleistete_Stunden + 0.25 * a.fahrtkosten) /100 *119),2)) AS gesamtpreis FROM kunde k, arbeitszeit a, projekt p WHERE a.projekt_id = p.id AND p.kunden_id = k.id AND a.datum BETWEEN ? AND ? AND k.id = ?';
    var variables = [months[0], months[1], kundendaten[0].id];
    var zeitraum = months[2];
  }
  var rechnungsdaten = await database.queryDB(sqlRD, variables);
  var preis = await database.queryDB(sqlP, variables)
  
  res.render('rechnung/singleRechnung', {
    titel: 'Rechnung',
    kundendaten: kundendaten, 
    rechnungsdaten: rechnungsdaten,
    preisdaten: preis,
    zeitraum: zeitraum
  })
});




//Kunde

//Kunden Startseite
app.get('/kunden', async (req, res) => {
  var sql = 'SELECT k.*, r.beschreibung FROM kunde k , rechnungformat r WHERE r.id = k.rechnung ORDER BY k.firmenname';
  var kunden = await database.queryDB(sql);
  res.render('kunde/kunden', {
    titel:"Kundenportal",
    data: kunden
  });
});

//Kunde anlegen Seite aufrufen
app.get('/kunde_anlegen', (req, res) => {
  res.render('kunde/kundeAnlegen',{
    titel: "Kunde anlegen"
  });
});

//Kunde anlegen & Weiterleitung auf kunden Startseite
app.post('/kunde_anlegen', async (req, res) =>{
  var sql = 'INSERT INTO kunde (firmenname, stundensatz, rechnung) VALUES (?,?,?)';
  var variables = [req.body.kundenname, req.body.stundensatz, req.body.rechnung];
  var kunde = await database.queryDB(sql, variables);
  console.log(kunde);
  res.redirect('/kunden'); 
});

//Kunde aktualisieren Seite
app.get('/update_kunde/:id', async (req, res) =>{
  var sql = 'SELECT * FROM kunde WHERE id = ?';
  var variables = [req.params.id];
  var kunde = await database.queryDB(sql, variables);
  if(kunde.length == 0){
    res.status(404).send({error: `Kunden ID ${req.params.id} wurde nicht gefunden`});
  }
  
  res.render('kunde/updateKunde',{
    titel: 'Kundendaten aktualisieren',
    data: kunde
  });
    
  
 
});

//Kunde aktualieren & Weiterleitung auf Kunden Startseite
app.post('/update_kunde/:id' , async (req, res) =>{
 
  var sql = 'UPDATE kunde SET firmenname = ?, stundensatz = ?, rechnung = ? WHERE id = ?';
  var variables = [req.body.kundenname, req.body.stundensatz, req.body.rechnung, req.params.id];
  var update = await database.queryDB(sql, variables);
  if (update.changedRows == 0 ){
    res.status(404).send({error: `Kunden ID ${req.params.id} wurde nicht gefunden. Update nicht möglich.`});
  }
  res.redirect('/kunden'); 
});











//Projekt

//Projekt Startseite
app.get('/projekte', async (req, res,) => {
  var sql = 'SELECT p.id, p.projektname, k.firmenname, SUM(a.geleistete_Stunden) AS stunden, SUM((a.geleistete_Stunden) * k.stundensatz + a.fahrtkosten * 0.25) AS kosten FROM projekt p, kunde k, arbeitszeit a WHERE p.kunden_id = k.id AND a.projekt_id = p.id GROUP BY p.id, p.projektname, k.firmenname UNION SELECT p.id, p.projektname, k.firmenname, 0 AS stunden, 0 AS kosten FROM projekt p, kunde k WHERE p.kunden_id = k.id AND p.id NOT IN (SELECT DISTINCT projekt_id FROM arbeitszeit)';
  var projekte = await database.queryDB(sql);
  res.render('projekt/projekte', {
    titel:"Projektportal",
    data: projekte
  });
});


//Projekt anlegen Seite
app.get('/projekt_anlegen', async (req, res) =>{
  var sql = 'SELECT k.*, r.beschreibung FROM kunde k , rechnungformat r WHERE r.id = k.rechnung ORDER BY k.firmenname';
  var firmennamen = await database.queryDB(sql);
  res.render("projekt/projektAnlegen", {
    titel: "Projekt anlegen",
    data: firmennamen
  });
});


//Projekt anlegen & Weiterleitung auf Projekt Startseite
app.post('/projekt_anlegen', async (req, res) =>{
  var sql = 'INSERT INTO projekt (kunden_id, projektname) VALUES (?,?)';
  var variables = [req.body.kunde, req.body.projektname];
  var projekt = await database.queryDB(sql, variables);
  res.redirect('/projekte');
});

//Projekt aktualiseren Seite laden
app.get('/update_projekt/:id', async (req, res) =>{
  var sql = 'SELECT p.*, k.firmenname FROM projekt p, kunde k  WHERE p.id = ? AND k.id = p.kunden_id';
  var variables = [req.params.id];
  var projekt = await database.queryDB(sql, variables);
  
   if(projekt.length == 0){
    res.status(404).send({error: `Projekt ID ${req.params.id} wurde nicht gefunden`});
  }
  
  res.render('projekt/updateProjekt',{
    titel: 'Projekt aktualisieren',
    data: projekt
  })
});

app.post('/update_projekt/:id', async (req, res) =>{
  var sql = 'UPDATE projekt SET projektname = ? WHERE id=?';
  var variables = [req.body.projektname, req.params.id];
  var projekt = await database.queryDB(sql, variables);
  
  if (projekt.changedRows == 0){
     res.status(404).send({error: `Projekt ID ${req.params.id} wurde nicht gefunden. Update nicht möglich.`});
  }
  res.redirect('/projekte');
});
  








//Mitarbeiter

//Mitarbeiter Übersichts Seite
app.get('/mitarbeiter', async (req, res) =>{
  var sql = 'SELECT m.id, m.vorname, m.nachname, SUM(geleistete_Stunden) AS stunden FROM mitarbeiter m , arbeitszeit a WHERE m.id = a.mitarbeiter_id GROUP BY m.id, m.vorname, m.nachname UNION SELECT id, vorname, nachname, 0 AS stunden FROM mitarbeiter WHERE id NOT IN (SELECT DISTINCT mitarbeiter_id FROM arbeitszeit) ORDER BY nachname, vorname';
  var mitarbeiter = await database.queryDB(sql);
  res.render('mitarbeiter/mitarbeiter' , {
    titel: 'Mitarbeiterprotal',
    data: mitarbeiter
  });
});

//Mitarbeiter anlegen Seite
app.get('/mitarbeiter_anlegen', (req, res) =>{
  res.render('mitarbeiter/mitarbeiterAnlegen',{
    titel: 'Mitarbeiter anlegen'
  });
  
});

//Mitarbeiter anlegen & Weiterleitung auf Mitarbeiter Startseite
app.post('/mitarbeiter_anlegen', async (req, res) =>{
  var sql = 'INSERT INTO mitarbeiter (vorname, nachname) VALUES (?,?)';
  var variables = [req.body.vorname, req.body.nachname];
  var mitarbeiter = await database.queryDB(sql, variables);
  res.redirect('/mitarbeiter');
});

//Mitarbeiter aktualisieren Seite laden
app.get('/update_mitarbeiter/:id', async (req, res) =>{
  var sql = 'SELECT * FROM mitarbeiter WHERE id = ?';
  var variables = [req.params.id];
  var mitarbeiter = await database.queryDB(sql, variables);
  
   if(mitarbeiter.length == 0){
    res.status(404).send({error: `Mitarbeiter ID ${req.params.id} wurde nicht gefunden`});
  }
  
  res.render('mitarbeiter/updateMitarbeiter', {
    titel: 'Mitarbeiter aktualisieren',
    data: mitarbeiter
  });
});

//Mitarbeiter aktualisieren & Weiterleitung auf Mitarbeiter Startseite
app.post('/update_mitarbeiter/:id' ,async (req, res) =>{
  var sql = 'UPDATE mitarbeiter SET vorname = ?, nachname = ? WHERE id=?';
  var variables = [req.body.vorname, req.body.nachname, req.params.id];
  var mitarbeiter = await database.queryDB(sql, variables);
  
  if(mitarbeiter.changedRows == 0){
     res.status(404).send({error: `Mitarbeiter ID ${req.params.id} wurde nicht gefunden. Update nicht möglich.`});
  }
  res.redirect('/mitarbeiter');
});




const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});