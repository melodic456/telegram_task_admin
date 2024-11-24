const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://melosryz:tgGnHlyxTWSRQvzM@cluster0.lf0wr.mongodb.net/mytesting?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
