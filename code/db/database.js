const knex = require("./knex");

function addUser(user) {
  return knex("users").insert(user);
}
function getUsers() {
  return knex("users").select("*");
}
function getUser(username) {
  return knex("users").where("name", username).select("*");
}
function deleteUser(username) {
  return knex("users").where("name", username).del();
}
function updateUser(username, user) {
  return knex("users").where("name", username).update(user);
}

module.exports = {
  addUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
};
