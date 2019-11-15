module.exports = {
    express: {
        port: process.env.PORT || 4000,
        session: {
            secret: process.env.EXPRESS_SESSION_SECRET,
        cookie: {
            secure: false,
        },
        },
    },
    scheme: "https",
    knex: {
        client: 'mysql',
        connection: {
            host : '127.0.0.1',
            user : 'root',
            password : 'TJIIvcrxaBuM',
            database : 'waagtoren'
        }
    }
};
