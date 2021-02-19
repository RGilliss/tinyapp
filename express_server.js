const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { emailLookUp } = require('./helpers.js');
const app = express();
const PORT = 8080; // default port 8080


//
// MIDDLEWARE
//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set('view engine', 'ejs');

//
// FUNCTIONS AND DATABASE
//

const users = {
  p1Tty: {
    id: 'p1Tty',
    email: 'lilo@dm.ca',
    password: '$2b$10$rhOYhikjPYXzQ5..B2wEyO0tWbHXD8SlVqKIiGiKjsaPTS7nIxMiG' //qwerty
  }
};

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'shF3nf' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'p1Tty' }
};

const urlsForUser = function(id) {
  let userURLs = {};
  for (let userID in urlDatabase) {
    const dataID = urlDatabase[userID].userID;
    if (dataID === id) {
      userURLs[userID] = urlDatabase[userID];
    }
  }
  return userURLs;
};

const generateRandomString = function() {
  let shortened = "";
  const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i <= 5; i++) {
    shortened += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return shortened;
};

//
// BROWSE
//

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    let id = req.session.user_id;
    const templateVars = {
      urls: urlsForUser(id),
      user: users[id],
    };
    res.render('urls_index', templateVars);
    return;
  }
  if (!req.session.user_id) {
    res.redirect('/noaccount');
    return;
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    let id = req.session.user_id;
    const templateVars = {
      urls: urlsForUser(id),
      user: users[id]
    };
    res.render('urls_new', templateVars);
    return;
  }
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
});

app.get('/register', (req, res) => {
  let id = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let id = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render('urls_login', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


//
//READ
//

app.get('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: shortURL,
      urls: urlsForUser(id),
      user: users[id],
    };
    for (const eachURL in templateVars.urls) {
      if (eachURL === shortURL) {
        res.render('urls_show', templateVars);
        return;
      }
    }
    res.redirect('/noaccount');
    return;
      
  }
  if (!req.session.user_id) {
    res.redirect('/noaccount');
    return;
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  for (let url in urlDatabase) {
    if (url === shortURL) {
      const longURL = urlDatabase[shortURL].longURL;
      res.redirect(longURL);
    }
  }
  res.redirect('/noaccount');
  return;
});

//
// ERRORS ROUTES AND CATCH ALL
//

app.get('/noaccount', (req, res) => {
  res.render('urls_no_account');
});

app.get('/error400', (req, res) => {
  res.render('urls_400');
});

app.get('/error403', (req, res) => {
  res.render('urls_403');
});

app.get('*', (req, res) => {
  res.redirect('/login');
});

//
//EDIT
//

//Resets longURL for given shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let newLong = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newLong, userID: req.session.user_id };
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
    return;
  }
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
});

//
//ADD
//

//Registers a new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "" || emailLookUp(email, users)) {
    res.redirect('/error400');
    return;
  }
  if (!req.session.user_id) {
    const id = generateRandomString();
    users[id] = { id: id, email: email, password: hashedPassword };
    req.session.user_id = id;
    res.redirect('/urls');
    return;
  }
});

//Login an existing user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = emailLookUp(email, users);
  if (!id) {
    res.redirect('/error403');
    return;
  }
  const hashedPassword = users[id].password;
  if (emailLookUp(email, users) && bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = id;
    res.redirect("/urls");
    return;
  }
  if (!emailLookUp(email, users) || !bcrypt.compareSync(password, hashedPassword)) {
    res.redirect('/error403');
    return;
  }
});

//Generates intial shortURL
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newLong, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

//Logout and clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//
//DELETE
//

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    const { shortURL } = req.params;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

