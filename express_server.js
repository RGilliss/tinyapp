const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');

//
// MIDDLEWARE
//

// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
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
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'shF3nf'},
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'p1Tty' }
};


const urlsForUser = function(id) {
  let userURLs = {};
  for (let userID in urlDatabase) {
    const dataID = urlDatabase[userID].userID
    if(dataID === id) {
      userURLs[userID] = urlDatabase[userID];
    }
  }
  return userURLs;
};

const generateRandomString = function () {
  let shortened = "";
  const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i <= 5; i++) {
    shortened += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return shortened;
}

const emailLookUp = function (email, users) {
  for (const id in users) {
    for (const userInfo in users[id]) {
      if (userInfo === 'email') {
        if (email === users[id][userInfo]) {
          return users[id];
        }
      }
    }
  }
  return false;
}

//
// BROWSE
//

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
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
  } else {
    res.send('Please login or register');
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
  } else {
    res.redirect('/login');
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

//Initialize templateVars in urls_show
app.get('/urls/:shortURL', (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const shortURL = req.params.shortURL
    const templateVars = {
      shortURL: shortURL,
      urls: urlsForUser(id),
      user: users[id],
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('Please login or register');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userDatabase = urlsForUser(id)
  const longURL = userDatabase[shortURL].longURL;
  res.redirect(longURL);
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
  urlDatabase[shortURL] = { longURL: newLong, userID: req.session.user_id};
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});

//
//ADD
//

//Registers a new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  if (email === "" || password === "" || emailLookUp(email, users)) {
    res.send('400 Bad Request');
    res.redirect('/register');
  } else {
    const id = generateRandomString();
    users[id] = {id: id, email: email, password: hashedPassword};
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

//Login an existing user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookUp(email, users);
  const id = user.id;
  const hashedPassword = users[id].password;
  if (emailLookUp(email, users) && bcrypt.compareSync(password, hashedPassword)) {
    // res.cookie('user_id', id);
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.send('403 Forbidden Client');
    res.redirect('/register');
  }
});

//Generates intial shortURL
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newLong, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//
//DELETE
//

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    const {shortURL} = req.params;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
