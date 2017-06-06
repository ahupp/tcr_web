firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.location = 'home';
  } 
});



/* LOGIN PROCESS */

$("#loginBtn").click(
  function(){
    var email = $("#loginEmail").val();
    var password = $("#loginPassword").val();

    if(email != "" && password != "") {
      //$("#loginProgress").show();
      //$("#loginBtn").hide();

      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("errror");

        $("#loginError").show().text(errorMessage);
        //$("#loginProgress").hide();
        //$("#loginBtn").show();
      });
    }
  }
);
