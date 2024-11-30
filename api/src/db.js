const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://melosryz:tgGnHlyxTWSRQvzM@cluster0.lf0wr.mongodb.net/mytesting2?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
