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

function generateRandomString() {
  let shortened = "";
  const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i <= 5; i++) {
    shortened += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return shortened;
}

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
}

function urlsForUser(id) {
  let userURLDatabase = {};
  for (const urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      userURLDatabase = {[urls]: urlDatabase[urls].longURL};
      console.log(userURLDatabase);
    }
  }
  return userURLDatabase;
}



//
// GET
//

//Redirect to /urls if logged in or /login if loged in
app.get('/', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


//Render urls_index page (/urls) with templateVars in urls_index
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

//Initialize templateVars in urls_show
app.get('/urls/:shortURL', (req, res) => {
  if (req.cookies.user_id) {
    const id = req.cookies.user_id;
    const templateVars = {
      urls: urlsForUser(id),
      user: users[id],
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('Please login or register');
  }
});

//Redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const urlObj = req.params.shortURL;
  const longURL = urlDatabase[urlObj].longURL;
  res.redirect(longURL);
});

//
//Part of Initial Set Up
//


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//
// POST
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
  let newShortURL = generateRandomString();
  let newLong = req.body.longURL;
  urlDatabase[newShortURL] = { longURL: newLong, userID: req.cookies.user_id};
  res.redirect(`/urls/${newShortURL}`);
});

//Resets longURL for given shortURL
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let newLong = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newLong, userID: req.cookies.user_id};
  res.redirect('/urls');
});

//delete
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies.user_id) {
    const {shortURL} = req.params;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Redirects from edit to :shortURL
app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});


app.post('/logout', (req, res) => {
  let id = req.cookies.user_id;
  res.clearCookie('user_id', id);
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
