
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

module.exports = { emailLookUp };