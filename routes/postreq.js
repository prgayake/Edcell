const express = require('express');
const firebase = require('firebase');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const router = express.Router();
const archiver = require('archiver');
const path = require('path');
const nodemailer = require('nodemailer');

var d = new Date();
const multer = require('multer');
const fs = require('fs-extra')



//Firebase Configuration Starts !!!
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DBURL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGESENDER,
    appId: process.env.APPID
};

//upload forms 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/upload_forms/' + req.session.username);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }

})

firebase.initializeApp(firebaseConfig);
let database = firebase.database();
var user = firebase.auth().currentUser;

//Firebase Configuration Ends !!!

// APPLY COOKIE SESSION MIDDLEWARE starts
router.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 3600 * 1000 // 1hr
}));



// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('index');
    }
    firebase.auth().onAuthStateChanged(function(user){
        console.log(user)
});
    next();
}

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        console.log('hey')
    }
    next();
}
//APPLY COOKIE SESSION MIDDLEWARE  End











//Login page Post Request
router.post('/login-register', ifLoggedin, (req, res) => {
    var username = req.body.username;
    var pass = req.body.user_pass;

    const db = firebase.database().ref();
    const query = db.child('users').child(username).get().then((snap) => {

        if (snap.val().Username == username) {
            firebase.auth().signInWithEmailAndPassword(snap.val().Email, pass).then(() => {
             var user = firebase.auth().currentUser;

             if(user.emailVerified)
               {
                 req.session.isLoggedIn = true;
                req.session.username = snap.val().Username;
                console.log(snap.val().Role)

                if (snap.val().Role == 'Incubatee') {

                    res.redirect('/incubateehome');


                }else if(snap.val().Role == 'Admin'){
                    res.redirect('/admin');
                }

                else {
                    res.redirect('/ecellhome');
                }


               }else{
                 user.sendEmailVerification();
                  res.render('login-register', { message: 'Please Verify Email ,Email is send on this email' });

               }


            }).then(function(usr) {}).catch(function(err) {
                console.log("");
                res.render('login-register', { message: 'Invalid username or Password' });

            });
        }

    }).catch((error) => {
        console.log("");
        res.render('login-register', { message: 'Invalid username or Password' });

    });








});


// Resgister Page Post Request
router.post('/register', ifLoggedin, (req, res, next) => {
    var name = req.body.user_name;
    var password = req.body.user_pass;
    var username = req.body.username;
    var email = req.body.user_email;
    var phone = req.body.phone;
    var role = req.body.role;
    var password = req.body.user_pass;
    var cpassword = req.body.cuser_pass;

    const db = firebase.database().ref();

    const query = db.child('users').child(username).get().then((snap) => {

        if (snap.exists()) {

            console.log(snap.val());
            console.log("Email And username Already in use !");
            res.render('register', { message: 'Email /username Already in use !' });
        } else {

            if (cpassword == password) {
                firebase.database().ref('users/' + username).set({
                    Name: name,
                    Email: email,
                    Username: username,
                    Mobile: phone,
                    Role: role,
                    Date: d.getFullYear()
                });

               firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error, userData) {


                });
               


                res.render('login-register', { message: 'Account Created Successfully' })
                console.log("data Added")
            } else {
                console.log('wrong Pass')
                res.render('register', { message: 'Password and Confirm Password Does not Match' });
            }

        }
    }).catch((error) => {
        console.error(error);
    });

});

router.post('/joinIncubatee',ifNotLoggedin,(req,res)=>{
    
    const db = firebase.database().ref();
 res.setHeader('Content-Type', 'text/html');
    const query = db.child('users').child(req.session.username).get().then((snap) => {
        var name =snap.val().Name
        const email =snap.val().Email
        const username =snap.val().Username
        var phone = snap.val().Mobile
        var role = req.body.role

     firebase.database().ref('users/' + username).set({
                    Name: name,
                    Email: email,
                    Username: username,
                    Mobile: phone,
                    Role: role,
                    Date: d.getFullYear()
                })

     res.redirect('/incubateehome')



 });
})

// Team Page Post Request
router.post('/team', function(req, res) {
    console.log('req.body');
    console.log(req.body);

    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('Team/' + req.session.username).set({
            Name: snap.val().Name,
            NamesOfMembers: req.body.name,
            Designation: req.body.Designation,
            Adhar_No: req.body.Adhar_no,
            Profile_info: req.body.profile,
            Relevant_Work_Experience: req.body.rw_experience,
            Qualification: req.body.Qualification,
            founderName: req.body.found_name,
            founderDesignation: req.body.found_designation,
            DIN_Number: req.body.found_DIN,
            founderContact: req.body.found_contact,
            founderEmail: req.body.found_email,
            founderLinkedin: req.body.found_linkedin

        }, function(err, result) {
            if (err) { throw err; } else {
                res.redirect('/ip_form')
            }
        });

    });
})
//-------------------------------------------------Basics-------Inserting Details---------------
const upload = multer({ storage });
router.post('/startup', upload.array('media'), function(req, res) {
    console.log('req.body');
    console.log(req.body);
    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('Basic/' + req.session.username).set({
            Name: snap.val().Name,
            product_name: req.body.product_name,
            startup_name: req.body.startup_name,
            Website: req.body.startup_web,
            Firm_date: req.body.fr_date,
            Register_place: req.body.flexRadioDefault,
            Company_Address: req.body.comp_address,
            State: req.body.state,
            district: req.body.district,
            city: req.body.city,
            Businessmodel: req.body.businesss_model,
            firm_type: req.body.firm_type,
            Registration_no: req.body.Registration_no,
            startup_sector: req.body.startup_sector,
            technology: req.body.technology,
            startup_descrption: req.body.startup_desc,
            other: req.body.other,
            team_size: req.body.team_size,
            startup_awards: req.body.awards,
            Social: req.body.hear_about_us,
            Incubator_name: req.body.Incubator_name,
            accont_name: req.body.acc_name,
            accont_no: req.body.acc_no,
            bank_name: req.body.bank_name,
            IFSC: req.body.IFSC,
            Branch: req.body.branch

        }, function(err, result) {
            if (err) {
                throw err;
            } else {
                res.redirect('/team')
            }
        });

    });
});

router.post('/Businessmodel', function(req, res) {
    console.log('req.body');
    console.log(req.body);

    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('Businessmodel/' + req.session.username).set({
            Name: snap.val().Name,
            stp_curr_stage: req.body.stp_curr_stage,
            uniqueness_factor: req.body.uniqueness_factor,
            key_partners: req.body.key_partners,
            cost_structure: req.body.cost_structure,
            Revenue_inflow: req.body.Revenue_inflow,
            Customer_Segment: req.body.Customer_Segment,
            Key_Matrix: req.body.Key_Matrix,
            Channels: req.body.Channels,
            Unique_Value: req.body.Unique_Value
        }, function(err, result) {
            if (err) {
                throw err;
            } else {
                res.redirect('/finance')
            }

        });

    });
});

router.post('/finance', upload.array('media'), function(req, res) {
    console.log('req.body');
    console.log(req.body);

    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('finance/' + req.session.username).set({
            Name: snap.val().Name,
            MaxTurnover: req.body.max_turnover,
            currentFunding: req.body.current_funding,
            TotalFund: req.body.total_funds,
            FinancialYear: req.body.Financial_year,
            AuditedFn: req.body.Audited_fn
        }, function(err, result) {
            if (err) {
                throw err;
            } else {
                res.redirect('/upload_form')
            }
        });

    });

});

// IP Form Post Request

router.post('/ip_form', upload.array('media'), function(req, res) {
    console.log('req.body');
    console.log(req.body);

    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('IpForm/' + req.session.username).set({
            Name: snap.val().Name,
            Product_name: req.body.Product_name,
            IP_Description: req.body.IP_Description,
            IP_No: req.body.IP_No,
            country: req.body.country,
            IP_validity: req.body.IP_validity,
        }, function(err, result) {
            if (err) { throw err; } else {
                res.redirect('/Businessmodel')
            }
        });

    });
});

router.post('/profile2', function(req, res) {
    console.log('req.body');

    const db = firebase.database().ref();

    firebase.database().ref('userdetails/' + req.session.username).set({
        Linkedin: req.body.Linkedin,
        Facebook: req.body.facebook,
        Instagram: req.body.Instagram,
        Portfolio: req.body.Portfolio,
        Awards: req.body.Awards,
        skill: req.body.skills


    }, function(err, result) {
        if (err) {
            throw err;
        } else {
            res.redirect('/profile')
        }
    });


});







router.post('/Upload_form', upload.array('media'), function(req, res) {
    console.log(req.body)
    
    const db = firebase.database().ref();
    db.child('users').child(req.session.username).on('value', function(snap) {
        firebase.database().ref('UploadDocDeatils/' + req.session.username).set({
            Name: snap.val().Name,
            PancardNo: req.body.PanNo,
            UdyogAdhar: req.body.UdyogAdhar,
            companyGSTIN: req.body.companyGSTIN,
            CompanyRegID: req.body.CompanyRegID


        }, function(err, result) {
        if (err) {
            throw err;
        } else {

            res.redirect('/')
        }
    })
        
    })
   

     
});

//forget Password
router.post('/forgetpass', (req, res, next) => {

    var emailres = req.body.emailreset;
    
    const db = firebase.database().ref();
    const query = db.child('users').orderByChild('Email').equalTo(emailres).get().then((snap) => {

        if (snap.exists())  {

        firebase.auth().sendPasswordResetEmail(emailres)
            .then(() => {
                res.render('register', { message: 'Email Sent' });

            })
            
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                // ..


                console.log(errorCode);
                console.log(errorMessage);
            });
    } else {
        res.render('forgetpass', { message: 'Please Enter Registered Email' });
    }
})
});

router.post('/getprofile', (req, res, next) => {
    var username = req.body.profilelink
    const db = firebase.database().ref();
    const query = db.child('users').child(username).on('value', snap => {
        res.render('profileview', {
            Name: snap.val().Name,
            Email: snap.val().Email,
            Mobile: snap.val().Mobile,
            Username: snap.val().Username,
            Role: snap.val().Role,
        })

    });

});


function Preparezipforeach(req, res, next) {


}



function deletezip(path) {

    fs.unlink(path, function(err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });
}


router.post('/getdocs', (req, res, next) => {

    var output1 = fs.createWriteStream('./uploads/upload_forms/' + req.body.profilelink + '.zip');
    var archive1 = archiver('zip');

    output1.on('close', function() {

        console.log(archive1.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        res.download('./uploads/upload_forms/' + req.body.profilelink + '.zip', function(error) {
            if (error) {
                console.log(error);
            } else {
                deletezip('./uploads/upload_forms/' + req.body.profilelink + '.zip')
            }

        })
    });

    archive1.on('error', function(err) {
        throw err;
    });

    var temp = archive1.pipe(output1);

    // append files from a sub-directory, putting its contents at the root of archive
    archive1.directory('./uploads/upload_forms/' + req.body.profilelink, false);
    archive1.finalize();


});
    



function copyfiles(arr,dir) {
      for (var i = 0; i < arr.length; i++) {
        fs.copy('./uploads/upload_forms/' + arr[i], dir+'/' + arr[i], err => {
            if (err) return console.error(err);
            
            console.log('success!');
        });
    }
    createzip()
}


function createdir(arr,dir){
            
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            copyfiles(arr,dir)
        }else{
            console.log('already Directory created !');
            copyfiles(arr,dir)
        }
}









function createzip()
{
    var output1 = fs.createWriteStream('./uploads/Docs.zip');
    var archive1 = archiver('zip');

    output1.on('close', function() {

        console.log(archive1.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        

    });

    archive1.on('error', function(err) {
        throw err;
    });

    var temp = archive1.pipe(output1);

    // append files from a sub-directory, putting its contents at the root of archive
  
    archive1.directory('./uploads/selected', false);
    archive1.finalize();
   
}


router.post('/getlink', (req, res) => {
    var arr = req.body.data
    dir = './uploads/selected'
    createdir(arr ,dir)
    res.send('Download Here <a href="/getfile">download<a>')

  

})
router.post('/profile', (req, res, next) => {

    var back1 = req.body.back;

    if (back1 == 'Incubatee') {
        res.redirect('/incubateehome')
    } 
    else{
        res.redirect('/ecellhome')
    }
});




module.exports = router;
