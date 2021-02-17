const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
//
// MIDDLEWARE
//

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//
// FUNCTIONS AND DATABASE
//

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
// GET
//

//Redirect to /urls if logged in or /login if loged in
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Render urls_index page (/urls) with templateVars in urls_index
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render("urls_new", templateVars);
});


//Initialize templateVars in urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: '',
    username: req.cookies['username'],
  };
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
//NEED TO FIX
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = req.params;
//   res.redirect(longURL);
// });

//
//Part of Initial Set Up
//


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//
// POST
//

//Generates intial shortURL
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[newShortURL] = newLong;
  res.redirect(`/urls/${newShortURL}`);
});

//Resets longURL for given shortURL
app.post("/urls/:shortURL", (req, res) => { 
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => { 
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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

app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect(`/urls`)
});



app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
