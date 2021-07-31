   // Required Packages  !!!!    
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const archiver = require('archiver');
const { body, validationResult } = require('express-validator');
const firebase = require('firebase');
require('dotenv').config({ path: './.env' })
const multer = require('multer');
const fs = require('fs-extra')




//Required Packages  End here !!!!


//pages and app configuration!!!    

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//setting Public directory

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
// SET OUR VIEWS AND VIEW ENGINE

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use('/', require('./routes/pages'));
app.use('/', require('./routes/postreq'));


//pages and app configuration Ends Here!!



// APPLY COOKIE SESSION MIDDLEWARE starts
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 3600 * 1000 // 1hr
}));



// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    res.setHeader("Content-Type", "text/html")
    if (!req.session.isLoggedIn) {
        return res.render('index');
    }

    next();
}

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {

    }
    next();
}

function preparezipforall(req, res, next) {

    var output = fs.createWriteStream('./uploads/IncubateeDocs.zip');
    var archive = archiver('zip');

    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        next();
    });

    archive.on('error', function(err) {
        throw err;
    });

    var temp = archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory('./uploads/upload_forms/', false);
    archive.finalize();



}




function Preparezipforeach(req, res, next) {
    var output1 = fs.createWriteStream('./uploads/upload_forms/' + req.session.username + '.zip');
    var archive1 = archiver('zip');

    output1.on('close', function() {
        console.log(archive1.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        next();
    });

    archive1.on('error', function(err) {
        throw err;
    });

    var temp = archive1.pipe(output1);

    // append files from a sub-directory, putting its contents at the root of archive
    archive1.directory('./uploads/upload_forms/' + req.session.username, false);
    archive1.finalize();


}



function deletezip(path) {

    fs.unlink(path, function(err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });
}


app.get('/download', preparezipforall, (req, res) => {

    res.download('./uploads/IncubateeDocs.zip', function(error) {
        if (error) {
            console.log(error);
        } else {
            deletezip('./uploads/IncubateeDocs.zip')
        }

    })


});

//

app.get('/cancelapplication',ifNotLoggedin,(req,res)=>{
    fs.remove('./uploads/upload_forms/'+req.session.username);
    res.redirect('/logout')
})






//logout Request
app.get('/logout', (req, res) => {
    firebase.auth().signOut().then(() => {
        console.log('signOut Successfully')
    }).catch((error) => {
        // An error happened.
    });
    req.session = null;
    res.redirect('index');
});

const port = process.env.PORT || 3020
app.listen(port, () => console.log("Server is Running...3020"));