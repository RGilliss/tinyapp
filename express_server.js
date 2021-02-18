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

const users = {
  shF3nf: {
    id: "shF3nf",
    email: "lilo@dm.ca",
    password: "qwerty"
  }, 
  KJdh3n: {
    id: "KJdh3n",
    email: "someGuy99@mail.net",
    password: "upupandaway"
  }
}

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
};

function emailLookUp(email) {
  for (const key in users) {
    for (const nestedKey in users[key]) {
      if (nestedKey === 'email') {
        if (email === users[key][nestedKey]) {
          return users[key];
        } 
      }
    }
  }
  return false;
};


//emailLookUp(req.body.email)
//
// GET
//

//Redirect to /urls if logged in or /login if loged in
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Render urls_index page (/urls) with templateVars in urls_index
app.get("/urls", (req, res) => {
  let id = req.cookies.user_id;
  const templateVars = { 
    urls: urlDatabase,
    user: users[id],
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let id = req.cookies.user_id;
  const templateVars = {
    user: users[id]
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let id = req.cookies.user_id;
  const templateVars = {
    user: users[id]
  }
  res.render("urls_register", templateVars)
})

app.get("/login", (req, res) => {
  let id = req.cookies.user_id;
  const templateVars = {
    user: users[id]
  }
  res.render("urls_login", templateVars)
});

//Initialize templateVars in urls_show
app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies.user_id;
  // console.log(users[id]);
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: '',
    user: users[id],
  };
  for (const shortURL in urlDatabase) {
    if (templateVars.shortURL === shortURL) {
      templateVars.longURL = urlDatabase[shortURL];
      break;
    } else {
      templateVars.longURL = 'No Related Long URL'
    }
  }
  // console.log(templateVars.user)
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

//Registers a new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  if (email === "" || password === "" || emailLookUp(email)) {
    res.send('400 Bad Request');
    res.redirect("/register");
  } else {
    const newUser = generateRandomString()
    users[newUser] = {id: newUser, email: email, password: password};
    res.cookie('user_id', newUser);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookUp(email);
  const id = user.id
  if (emailLookUp(email) && user.password === password) {
    res.cookie('user_id', id);
    res.redirect("/urls");
  } else {
    res.send('403 Forbidden Client');
    res.redirect("/register");
  }
});

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


app.post('/logout', (req, res) => {
  let id = req.cookies.user_id;
  res.clearCookie('user_id', id);
  res.redirect(`/login`)
});



app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
