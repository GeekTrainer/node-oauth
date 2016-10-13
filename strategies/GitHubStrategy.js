const GitHubStrategy = require('passport-github2').Strategy;

module.exports = {
    configurePassport: (passport) => {
        passport.use('github', new GitHubStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.REDIRECT_URI
        },
            (token, tokenSecret, profile, done) => {
                process.nextTick(() => {
                    console.log('authenticated!!!!!');
                    return done(null, profile);
                });
            }
        ));
    }
}