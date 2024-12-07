require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const authRoutes = require("./src/routes/authRoutes");

const guideInfoRoutes = require("./src/routes/guideInfoRoutes");
const workRoutes = require("./src/routes/workRoutes");
const tourRoutes = require("./src/routes/tourRoutes");
const schoolRoutes = require("./src/routes/schoolRoutes");
const advisorRoutes = require("./src/routes/advisorRoutes");
const userManagementRoutes = require("./src/routes/userManagementRoutes");
const dataRoutes = require("./src/routes/dataRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const fairRoutes = require("./src/routes/fairRoutes");
const individualTourRoutes = require('./src/routes/individualTourRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

app.use(cors());
app.use(express.json());
app.set("io", io);

app.use('/uploads', express.static('uploads'));
app.use('/profile', profileRoutes);
app.use("/auth", authRoutes);
app.use("/guide-info", guideInfoRoutes);
app.use("/work", workRoutes);
app.use("/tour", tourRoutes);
app.use("/school", schoolRoutes);
app.use("/advisors", advisorRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/feedback", feedbackRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/data', dataRoutes);
app.use('/individual-tours', individualTourRoutes);
app.use("/fairs", fairRoutes); 

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
