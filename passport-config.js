const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

require('./strategies/GitHubStrategy.js').addStrategy(passport);

module.exports = passport;