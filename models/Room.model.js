const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  acreage: {
    type: Number,
    required: true,
  },
  locationImage: {
    type: String,
    required: false,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  phoneNumber: {
    type: String,
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: String, required: false },
    lng: { type: String, required: false },
    coordinates: [{ type: String, required: false }],
  },
  rentPerMonth: {
    type: Number,
    required: false,
  },
}, { collection: 'room' });

module.exports = mongoose.model("Room", RoomSchema);
