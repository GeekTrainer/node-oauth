const GitHubStrategy = require('passport-github2').Strategy;

module.exports = {
    addStrategy: (passport) => {
        passport.use('github', new GitHubStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: `${process.env.HOST}${process.env.REDIRECT_PATH}`
        },
            (token, tokenSecret, profile, done) => {
                process.nextTick(() => {
                    return done(null, profile);
                });
            }
        ));
    }
}