const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

//
// MIDDLEWARE
//

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//
// FUNCTIONS AND DATABASE
//

const users = {
  shF3nf: {
    id: 'shF3nf',
    email: 'lilo@dm.ca',
    password: 'qwerty'
  },
  KJdh3n: {
    id: 'KJdh3n',
    email: 'sg99@mail.net',
    password: '12345'
  }
};


const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'shF3nf'},
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'KJdh3n' }
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

generateRandomString = function () {
  let shortened = "";
  const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i <= 5; i++) {
    shortened += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return shortened;
}

emailLookUp = function (email) {
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
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  if (req.cookies.user_id) {
    let id = req.cookies.user_id;
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
  if (req.cookies.user_id) {
    let id = req.cookies.user_id;
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
  let id = req.cookies.user_id;
  const templateVars = {
    urls: urlsForUser(id),
    user: users[id]
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let id = req.cookies.user_id;
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
  if (req.cookies.user_id) {
    const id = req.cookies.user_id;
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
  const id = req.cookies.user_id;
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
  urlDatabase[shortURL] = { longURL: newLong, userID: req.cookies.user_id};
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.cookies.user_id) {
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
  if (email === "" || password === "" || emailLookUp(email)) {
    res.send('400 Bad Request');
    res.redirect('/register');
  } else {
    const newUser = generateRandomString();
    users[newUser] = {id: newUser, email: email, password: password};
    res.cookie('user_id', newUser);
    res.redirect('/urls');
  }
});

//Login an existing user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookUp(email);
  const id = user.id;
  if (emailLookUp(email) && user.password === password) {
    res.cookie('user_id', id);
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
  urlDatabase[shortURL] = { longURL: newLong, userID: req.cookies.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  let id = req.cookies.user_id;
  res.clearCookie('user_id', id);
  res.redirect('/login');
});

//
//DELETE
//

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies.user_id) {
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
