const { db } = require("../config/db.js");
const bcrypt = require("bcrypt");

module.exports = {
  createUser: async (userinfo) => {
    const { name, surname, username, email, password } = userinfo;

    const trx = await db.transaction();

    try {

      const existingUser = await trx("authusers")
      .where({email})
      .orWhere({ username })
      .first();

      if (existingUser) {
        throw new Error("Email or Username already exists");
      }

      /** hash the password */
      const hashPassword = await bcrypt.hash(password + "", 10);

      const [user] = await trx("authusers").insert(
        { name, surname, username, email, password: hashPassword },
        ["id", "name", "surname", "username", "email"]
      );

      await trx.commit();

      return user;

    } catch (error) {
      await trx.rollback();
      console.log(error);
      throw error;
    }
  },

  getUserByEmail: async (email = "") => {
    try {
      return await db("authusers")
        .select("id", "name", "surname", "username", "email", "password")
        .where({ email })
        .first();

      
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      return await db("authusers")
        .select("id", "name", "surname", "username", "email")
        .where({ id })
        .first();
    } catch (error) {
      throw error;
    }
  },
  
  getUserByUsername: async (username = "") => {
    try {
      return await db("authusers")
        .select("id", "name", "surname", "username", "email", "password")
        .where({ username })
        .first();
    } catch (error) {
      throw error;
    }
  },

  getUsers: async () => {
    try {
      return await db("authusers").select("id", "email");
    } catch (error) {
      throw error;
    }
  },
  
  updateUser: async (id, userDetails) => {
    try {
      const [updatedUser] = await db("authusers")
        .where({ id })
        .update(userDetails)
        .returning(["id", "name", "surname", "email", "username"]);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
};
