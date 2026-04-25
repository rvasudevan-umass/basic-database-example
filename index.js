const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

app.use(express.static(path.join(__dirname, 'public'))); //gives you access to static files in the "public" folder
app.set('view engine', 'ejs'); //uses EJS as template for views
app.use(express.urlencoded({ extended: true })); //middleware to parse the form data from the HTML body

const { DatabaseSync } = require('node:sqlite'); //enable sqlite in Node
// const db = new DatabaseSync('database.db', { readonly: false }); //create/open connection with the database file
const db = new DatabaseSync('/data/database.db', { readonly: false }); //for persistent volume on Railway. Uncomment this and comment out the previous line prior to deploying your application.

//create the database and specify the columns you want to include. SQLite only has a few datatypes we can use, available here: https://www.sqlite.org/datatype3.html 

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        year TEXT NOT NULL,
        major TEXT NOT NULL,
        color TEXT NOT NULL
    );
`);

//when the page is loaded, select all the entries from the DB and display them on the homepage
app.get('/', (req, res) => {
    let users = db.prepare('SELECT * FROM users').all();
    res.render('index', {'users': users});
    //res.send("Test");
});

//When the form is submitted, collect all the information from the EJS file (the names here correspond to the "name" attribute on each form element), and insert them into the database.
app.post('/', (req, res) => {
   let name = req.body['name'];
   let year = req.body['year'];
   let major = req.body['major'];
   let color = req.body['color'];
   //console.log([name, year, major, color]);
   db.prepare('INSERT INTO users (name, year, major, color) VALUES (?, ?, ?, ?)').run(name, year, major, color);
   //console.log("Users updated");

   //after the DB is updated, the page renders exactly how it would otherwise, just with the new addition added
   let users = db.prepare('SELECT * FROM users').all();
    res.render('index', {'users': users});

});

// app.post('/confirm', (req, res) => {
    // let name = req.body['name'];
    // let year = req.body['year'];
    // let major = req.body['major'];
    // let color = req.body['color'];
    //console.log([name, year, major, color]);
    // db.prepare('INSERT INTO users (name, year, major, color) VALUES (?, ?, ?, ?)').run(name, year, major, color);
//     res.render('confirm');
// });

app.listen(port, () => {
    console.log('Now listening on port 8080...');
});
