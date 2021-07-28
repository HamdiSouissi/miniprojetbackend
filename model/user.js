const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, unique: true },
  role: { type: String, default:null },
  password: { type: String },
  etat:{type:String, default:"non vacciné"},
  token: { type: String },
});

module.exports = mongoose.model("user", userSchema);
