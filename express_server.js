const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
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
// GET
//

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const eachShortURL = Object.keys(urlDatabase)[Object.keys(urlDatabase).length - 1];
  const templateVars = { shortURL: eachShortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = Object.values(urlDatabase)[Object.values(urlDatabase).length - 1];
  res.redirect(longURL);
});

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
//  POST
//

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[newShortURL] = newLong;
  res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => { 
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls_show", (req, res) => { 
  const {longURL} = req.body;
  const newKey = generateRandomString()
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL] === longURL) {
      urlDatabase[shortURL] = urlDatabase[newKey];
      urlDatabase[newKey] = longURL;
      delete urlDatabase[shortURL];
    };
  }
  res.redirect("/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  res.redirect('/urls/:shortURL')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});