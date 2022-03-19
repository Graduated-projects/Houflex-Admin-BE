const express = require("express");
const app = express();
require("dotenv").config();

const mongoose = require("mongoose");
const path = require("path");
require("dotenv/config");
app.use(express.static(__dirname + "/public"));

const LinkOfRoom = require("./models/LinkOfRoom.model");
const Room = require("./models/Room.model");
// config fs

var fs = require("fs");
const { setTimeout } = require("timers/promises");
const RoomModel = require("./models/Room.model");

//config axios
const axios = require("axios").default;

//Setup database
const uri =
  "mongodb+srv://luutkha:Kugayuma1@cluster0.hkc82.mongodb.net/crawlChoTot?retryWrites=true";
mongoose.Promise = global.Promise;
// mongoose.set("useFindAndModify", false);
const db = mongoose.connection;
mongoose.connect(process.env.DB_CONNECTION || uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
  // useCreateIndex: true,
});
db.on("error", console.error.bind(console, "MongoDB connection error:"));
//End DB Section
app.get("/get-long-lat/", async (req, res) => {
  let rooms = await Room.find().skip(400).limit(400);
  let results = [];
  let results_without_errs = [];
  let errors = [];
  let promise_arr = [];
  for (let index = 0; index < rooms.length; index++) {
    const room = rooms[index];
    console.log(room.address);
    promise_arr.push(
      axios.get(
        "https://maps.google.com/maps/api/geocode/json?key=AIzaSyAT4hhGVM0TyfNAKIJwhlFHqUuQQUiTJGs&address=" +
          encodeURI(room.address)
      )
    );
    if ((index + 1) % 6 === 0) {
      await Promise.all(promise_arr).then((data) => {
        data.forEach((roomData, index) => {
          if (roomData.data?.results[0]?.geometry) {
            results.push(roomData.data.results[0].geometry.location);
            results_without_errs.push(
              roomData.data.results[0].geometry.location
            );
            room.location = roomData.data.results[0].geometry.location;
          } else {
            console.log("ID: " + room._id + " không thể tìm thấy long/lat!");
            errors.push(room._id);
            results.push({ lat: 0, lng: 0 });
            room.location = { lat: 0, lng: 0 };
          }
        });
      });
      promise_arr = [];
    }
  }
  await fs.writeFile(
    "results.txt",
    JSON.stringify(results),
    "utf8",
    function (err) {
      //Kiểm tra nếu có lỗi thì xuất ra lỗi
      if (err) throw err;
      //nếu không thì hiển thị nội dung ghi file thành công
      else console.log("Ghi file thanh cong!");
    }
  );
  await fs.writeFile(
    "results_without_error.txt",
    JSON.stringify(results_without_errs),
    "utf8",
    function (err) {
      //Kiểm tra nếu có lỗi thì xuất ra lỗi
      if (err) throw err;
      //nếu không thì hiển thị nội dung ghi file thành công
      else console.log("Ghi file thanh cong!");
    }
  );
  await fs.writeFile(
    "errors.txt",
    JSON.stringify(errors),
    "utf8",
    function (err) {
      //Kiểm tra nếu có lỗi thì xuất ra lỗi
      if (err) throw err;
      //nếu không thì hiển thị nội dung ghi file thành công
      else console.log("Ghi file thanh cong!");
    }
  );
  console.log(results.length);
  res.status(200).json({
    result: results.length,
    error: errors.length,
    results_without_errs: results_without_errs.length,
  });
});
app.get("/", async (req, res) => {
  let rooms = await Room.find();
  console.log(rooms.length);
  for (let index = 0; index < rooms.length; index++) {
    let rentPerMonth = 0
    const room = rooms[index];
    console.log(room.address);
    room.location = { lat: 0, lng: 0 };
    if (room.deposit > 1000000) rentPerMonth = room.deposit;
    else rentPerMonth = 1000000;
    // try {
    //   const location = await axios.get(
    //     "https://maps.google.com/maps/api/geocode/json?key=AIzaSyAT4hhGVM0TyfNAKIJwhlFHqUuQQUiTJGs&address=" +
    //       encodeURI(room.address)
    //   );
    //   if (location.data?.results[0]?.geometry) {
    //     // room.location = location.data.results[0].geometry.location;
    //     await RoomModel.updateOne(
    //       { _id: room._id },
    //       { location: location.data.results[0].geometry.location }
    //     );
    //   } else {
    //     await RoomModel.updateOne(
    //       { _id: room._id },
    //       { location: { lat: 0, lng: 0 } }
    //     );
    //   }
    // } catch (error) {
    //   await RoomModel.updateOne(
    //     { _id: room._id },
    //     { location: { lat: 0, lng: 0 } }
    //   );
    // }
    await RoomModel.updateOne({_id: room.id},{rentPerMonth: rentPerMonth })
  }
  res.status(200).json({ message: "Cập nhật thành công" });
});

app.get("/img", async (req,res) =>{
  let rawdata = fs.readFileSync('room.json');
  let roomImage = JSON.parse(rawdata);
  let rooms = await Room.find();

  for (let index = 0; index < rooms.length; index++) {
    const room = rooms[index];

    let randomListImageObj = roomImage[Math.floor(Math.random() * roomImage.length)];
    await RoomModel.updateOne(
      { _id: room._id },
      { images: randomListImageObj.images}
    );
    console.log(randomListImageObj.images)
    console.log(room)
  }
  res.status(200).json(roomImage.length)
})
app.listen(process.env.PORT, () =>
  console.log("Admin Service Listening on PORT " + process.env.PORT)
);
