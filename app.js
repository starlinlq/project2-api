require("dotenv").config();
const fileUpload = require("express-fileupload");
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const connectDB = require("./db/connect");
const notFound = require("./routes/notFound");
const handleErrors = require("./errors/handle-errors");
const post = require("./routes/post");
const commentRoutes = require("./routes/comment");
const profileRoutes = require("./routes/profile");
const upload = require("./controllers/upload");

//middleware
app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", post);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/user", profileRoutes);
//upload
app.post("/api/v1/upload", upload);
app.use(notFound);
app.use(handleErrors);

const PORT = process.env.PORT || "3000";

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`server listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
