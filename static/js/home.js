function errorHandler() {
  console.log("error");
  alert("Participant already exists");
}

function deleteUser(id) {
  console.log("trying to delete ");
  console.log(id);
  let tasksURL = "tasks/" + id;
  let usersURL = "users/" + id;
  firebase.database().ref().child(tasksURL).remove();
  firebase.database().ref().child(usersURL).remove();
  window.location = '/home';
}

//inserting row function
let participantID = -1;

function addTask(information) {
  var split = information.split("/");
  var userID = split[0];
  let category = split[1];
  let url = "tasks/" + userID + "/";
  var rootRef = firebase.database().ref().child("tasks/" + userID);
  return rootRef.once('value').then(function(snapshot) {
    var newTask = {};
    newTask = {0: "", 1: "", 2: "", 3:""};
      var taskList = {};
      taskList = snapshot.val();
      taskList[category].push(newTask);
      firebase.database().ref().child(url).set(taskList);
      displayActiveUserTasks(taskList, userID);
    });
}

function deleteFunction(information) {
  var split = information.split("/");
  var userID = split[0];
  firebase.database().ref().child("tasks/" + information).remove();
  var rootRef = firebase.database().ref().child("tasks/" + userID);

  return rootRef.once('value').then(function(snapshot) {
    var taskList ={};
    taskList = snapshot.val();
    displayActiveUserTasks(taskList, userID);
    });
}

function displayActiveUserTasks(activeUserTasks,id) {

  var nameToAdd = activeUserTasks["Participant Name"];
  var coachName = "Coach: " + activeUserTasks["Coach Name"];
  //set up heading with user name and coach name
  var pageHeading = "<h5>" + coachName + "</h5><hr>";
  document.getElementById("heading").innerHTML  = pageHeading;
  var layout = activeUserTasks["layout"];
  var headings = {};
  var newTables = "";
  for (var category in layout) {
    //headings
    if(typeof layout[category] === 'string' ) {
      //create table with this heading
      headings += layout[category];
      //set up heading
      newTables+= "<div class=\"card\"> <div class=\"card-header\">" +
      layout[category] + "</div><div class=\"card-block\">";
      //add data
      newTables += "<table id='"+layout[category] +  "'class=\"table table-bordered\">"
      var tasks = activeUserTasks[layout[category]];
      for(var key in tasks) {
        newTables += "<tr id =" + key + ">";
        for(var info in tasks[key]) {
          newTables += "<td contenteditable class=" + category + ">" + tasks[key][info] + "</td>";
        }
        if(key != 0) {
          newTables += "<td><a onclick= \"deleteFunction('" + id + "/"+ layout[category] + "/" + key + "')\"class=\"red-text\"><i class=\"fa fa-times\"></i></a></td>";

        /*
          <button class = \"btn btn-sm\"onclick= \"deleteFunction('" + id + "/"+ layout[category] + "/" + key + "')\"type=\"button\" class=\"btn btn-secondary btn-sm\">" +
            "<i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></button></td>";

          newTables += "<td><button class = \"btn btn-sm\"onclick= \"deleteFunction('" + id + "/"+ layout[category] + "/" + key + "')\"type=\"button\" class=\"btn btn-secondary btn-sm\">" +
            "<i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></button></td>"
            */
        } else {
          newTables += "<td></td>"
        }
        newTables += "</tr>";
      }
      newTables += "</table><button class=\"btn btn-rounded btn-deep-purple lighten-1\"onclick=\"addTask('" + id + "/" + layout[category] + "')\"> Add Task </button></div></div>" +
      "<hr>";
    } else {
      alert("File format corrupted or mismatched: contact Stanford TCR team.")
    }
    document.getElementById("tablesToAdd").innerHTML = newTables +"<button class=\"btn btn-danger\" onclick=\"deleteUser('" + id + "')\"> Delete User</button>" ;
  }
  document.getElementById("nameHead").innerHTML = nameToAdd;
}

var rootRef = firebase.database().ref().child("tasks");
rootRef.once('value').then(function(snapshot) {
  var ourList = "";
  //append the name to our list of names
  var allTasks = {};
  allTasks = snapshot.val();

  for(var key in allTasks) {
    ourList += "<a class=\"list-group-item\" id = " + key + ">"
      + allTasks[key]["Participant Name"] + "</a>"
  }
  document.getElementById("userList").innerHTML = ourList;

  $("a").click(function() {
    var id = $(this).attr('id');
    participantID = id;
    if(allTasks[id]["Participant Name"] != null) {
      displayActiveUserTasks(allTasks[id], id);
    }
  });
});


document.addEventListener('keydown', function (event) {
  var esc = event.which == 27,
  nl = event.which == 13,
  target = event.target,
  input = target.isContentEditable;

  if (input) {
    if (esc) {
      // restore state
      document.execCommand('undo');
      target.blur();
    } else if (nl) {
      let url = "tasks/" + participantID + "/";
      let subcategoryElem = target.parentElement.parentElement.parentElement;
      let subcategory = subcategoryElem.id;
      let card = subcategoryElem.parentElement.parentElement;
      let category = card.children[0].innerHTML;
      url += category;
      if(category != subcategory) {
        url += "/" + subcategory;
      }

      let row = target.cellIndex;
      let col = target.parentElement.rowIndex;
      url += "/" + col;
      url += "/" + row;
      firebase.database().ref().child(url).set(target.innerHTML);

      target.blur();
      event.preventDefault();
    }
  }
}, true);

/* LOGOUT PROCESS */
$("#logoutBtn").click(function(){
    firebase.auth().signOut().catch(function(error) {
      // An error happened.
      alert(error.message);
  });
});

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location = '/index';
  }
});

function filter() {
  // Declare variables
  var input, filter, list, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  list = document.getElementById("userList");
  tr = list.getElementsByTagName("a");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = list.getElementsByTagName("a")[i];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
