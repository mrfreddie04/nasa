const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true
  },  
  mission: {
    type: String,
    required: true
  },
  rocket: {
    type: String,
    required: true
  },
  launchDate: {
    type: Date,
    required: true
  },
  target: {
    type: String,
    //required: true
  },
  customers: [{
    type: String
  }],
  upcoming: {
    type: Boolean,
    required: true,
    default: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  } 
});

//Model connects launchesSchema with "launches" collection
const Launch = mongoose.model("Launch", launchesSchema);

module.exports = Launch;