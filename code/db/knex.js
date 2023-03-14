const knex = require("knex");

const connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: "./db/users.db",
  },
  useNullAsDefault:true
});

module.exports = connectedKnex;
