require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
const Slot = require("./models/Slot");

const seedSlots = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const slots = [
      { id: "1", status: "free", vehicleType: "bike" },
      { id: "2", status: "occupied", vehicleType: "bike" },
      { id: "3", status: "free", vehicleType: "car" },
      { id: "4", status: "occupied", vehicleType: "car" },
    ];

    await Slot.deleteMany({});
    await Slot.insertMany(slots);

    console.log("Slots seeded!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding slots:", err);
  }
};

seedSlots();
