const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let shortened = "";
  const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i <= 5; i++) {
    shortened += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return shortened;
}

//
// MIDDLEWARE
//

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//
// CREATE
//

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Initialize templateVars in urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Initialize templateVars in urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: ''};
  for (const shortURL in urlDatabase) {
    if (templateVars.shortURL === shortURL) {
      templateVars.longURL = urlDatabase[shortURL];
      break;
    } else {
      templateVars.longURL = 'No Related Long URL'
    }
  }
  res.render("urls_show", templateVars);
});

//Redirect to longURL
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = req.params;
//   res.redirect(longURL);
// });

//
//Part of Initial Set Up
//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//
// READ
//



//
//  UPDATE
//

//Generates intial shortURL
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[newShortURL] = newLong;
  res.redirect(`/urls/${newShortURL}`);
});

//Resets shortURL for given longURL
app.post("/urls/:shortURL", (req, res) => { 
  const {longURL} = req.body;
  const newKey = generateRandomString()
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL] === longURL) {
      urlDatabase[shortURL] = urlDatabase[newKey];
      urlDatabase[newKey] = longURL;
      delete urlDatabase[shortURL];
    };
  }
  res.redirect(`/urls`);
});

//Redirects from edit to :shortURL
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL
  res.redirect(`/urls/${shortURL}`)
});

//sets cookie to username
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

//
// DELETE
//

app.post("/urls/:shortURL/delete", (req, res) => { 
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});