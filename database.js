var mysql = require('mysql');

//Datenbank Verbindung
  var connection = mysql.createConnection({
    host: '91.204.46.47',
    user: 'k121749_tester',
    password: 'tester',
    database:'k121749_Web_scharle'
});

connection.connect(function(err){
  if(err) throw err;
  console.log('connected');
});

//Monate der einzelnen Quartale
  var firstQ = ['01', '02', '03'];
  var secondQ = ['04', '05', '06'];
  var thirdQ = ['07', '08', '09'];
  var fourthQ = ['10', '11', '12'];


module.exports = {
//SQL Ausführung
//Rufe Funktion auf mit SQL statement und wenn erforderlich den Variablen als Array
queryDB:(sql, variables = null) =>{
  return new Promise((resolve, reject) => {
      connection.query(sql, variables, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    });
},

//Quartalsanfang und Quartalsende bekommen, sowie welches Quartal
getQuartalszeiten:(month, year) =>{
  if(firstQ.includes(month)){
       var times = [year + '-01-01', year + '-03-31', "1. Quartal " + year];
     } else if(secondQ.includes(month)){
       var times = [year + '-04-01', year + '-06-30', "2. Quartal " + year];
     } else if(thirdQ.includes(month)){
       var times = [year + '-07-01', year + '-09-30', "3. Quartal " + year ];
     } else if(fourthQ.includes(month)){
       var times = [year + '-10-01', year + '-12-31', "4. Quartal " + year];
     }
  return times
}

}

