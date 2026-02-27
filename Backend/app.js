const express = require("express");
const cors = require("cors");
const productRouter = require("./app/routes/product.routes");
const categoryRouter = require("./app/routes/category.routes");
const brandRouter = require("./app/routes/brand.routes");
const sportRouter = require("./app/routes/sport.routes");
const errorHandler = require("./app/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/sports", sportRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sports Store API!" });
});

app.use(errorHandler);

module.exports = app;
