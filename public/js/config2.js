 var  username = document.getElementById('username').textContent;

                   var firebaseConfig = {
                projectId: "ecellweb-5bc04",
                storageBucket: "ecellweb-5bc04.appspot.com"
              }; 

              firebase.initializeApp(firebaseConfig);
      
            var db = firebase.database().ref();
      db.child('finance').child(username).on('value',snap1 => {
        db.child('Basic').child(username).on('value',snap2 => {
            db.child('Businessmodel').child(username).on('value',snap3 => {
                db.child('Team').child(username).on('value',snap4 => {
                    db.child('IpForm').child(username).on('value',snap5 => {
                        db.child('UploadDocDeatils').child(username).on('value',snap6 =>{
                           if(snap2.val()!=null && snap1.val()!=null && snap3.val()!=null && snap4.val()!=null && snap6.val()!=null){
                            
                              document.getElementById('getform').disabled = true;
                      
                            }else{
                              document.getElementById('viewform').disabled = true;

                            }
          
                 
                        })
                      })
                    })
                })
            })
        })