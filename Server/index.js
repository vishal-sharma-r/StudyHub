const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const databaseConnect = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");

// routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactRoutes = require("./routes/Contact");

const PORT = process.env.PORT || 4000;
// connect to database
databaseConnect.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
// make use of cors to do frontend request
// app.use(
//   cors({ 
//     origin: "http://localhost:3000",
//      credentials: true 
//     })
// );
app.use(
  cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
    credentials: true,
    maxAge: 14400,
  })
);
// file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//cloudinary connection
cloudinaryConnect();

// mount the routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/reach",contactRoutes);

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});
// activating the sever

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
