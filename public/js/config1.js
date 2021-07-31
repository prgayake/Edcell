 var  uname = document.getElementById('uname').textContent;
                var firebaseConfig = {
                projectId: "ecellweb-5bc04",
                storageBucket: "ecellweb-5bc04.appspot.com"
              }; 
              // Initialize Firebase
              firebase.initializeApp(firebaseConfig);
            var db = firebase.database().ref();
            const query = db.child('userdetails').child(uname).on('value',snap =>{
                console.log(snap.val())
                 document.getElementById('linkedin1').value =snap.val().Linkedin;
                 document.getElementById('fb').value =snap.val().Facebook;
                 document.getElementById('insta').value =snap.val().Instagram;
                 document.getElementById('portfolio').textContent =snap.val().Portfolio;
                 document.getElementById('Awards').textContent =snap.val().Awards;
                 document.getElementById('skill').textContent =snap.val().skill;   
                 

                


            })  