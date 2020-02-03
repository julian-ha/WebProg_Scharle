//Datum max Property auf heute setzen, um keine Arbeitszeiten in der Zukunft eintragen zu können
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //Januar ist 0
var yyyy = today.getFullYear();
 if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 

today = yyyy+'-'+mm+'-'+dd;
document.getElementById("datum").setAttribute("max", today);

function getProjekt(kunde) {
    var xhttp = new XMLHttpRequest();
    var x = document.getElementById("projekt");
    x.options.length = 1;
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        for (var i = 0; i < myArr.length; i++) {
          var option = document.createElement("option");
          option.text = myArr[i].projektname;
          option.value = myArr[i].id;
          x.add(option);
        }
      }
    };
    var path = '/get_projekte/';
    xhttp.open("POST", path.concat(kunde), true);
    xhttp.send();

  }

  function getUNIXTime(datum, time, id) {
    var zeit = datum + ' ' + time + ':00';
    document.getElementById(id).value = zeit;
    return (new Date(zeit).getTime() / 1000)
  }

  function validate() {
    var errors = [];
    
    //prüfen ob arbeitsende nach arbeitsbeginn + Pause & ob Pause größer als Arbeitszeit ist
    var pause = document.getElementById('pause').value;
    var datum = document.getElementById('datum').value;

    var ab = getUNIXTime(datum, document.getElementById('arbeitsbeginn').value, 'abUNIX');
    var ae = getUNIXTime(datum, document.getElementById('arbeitsende').value, 'aeUNIX');

    if (ae <= ab) {
      errors.push('Arbeitsende kann nicht vor oder gleich Arbeitsbeginn sein.');
    }
    var arbeitszeit = (ae - ab) / 3600;

    if (arbeitszeit <= pause / 60) {
      errors.push('Fehlerhafte Eingabe. Mehr Pause als Arbeitszeit inklusive Pause');
    }

    var reineArbeitszeit = arbeitszeit - (pause / 60);
    document.getElementById('arbeitszeit').value = reineArbeitszeit;

    //prüfen ob Feld kunde = 0, & ob ein Projekt/Mitarbeiter ausgewählt wurde
    var kunde = document.getElementById('kunde').value;
    var projekt = document.getElementById('projekt').value;
    var mitarbeiter = document.getElementById('mitarbeiter').value;
    if (kunde == 0) {
      errors.push('Bitte wählen Sie einen Kunden aus.');
    }
    if (projekt == 0) {
      errors.push('Bitte wählen Sie ein Projekt aus');
    }
    if (mitarbeiter == 0) {
      errors.push('Bitte wählen Sie einen Mitarbeiter aus');
    }
    

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return false;
    }
    return true;

  }