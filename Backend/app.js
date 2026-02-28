const express = require("express");
const cors = require("cors");
const productRouter = require("./app/routes/product.routes");
const categoryRouter = require("./app/routes/category.routes");
const brandRouter = require("./app/routes/brand.routes");
const sportRouter = require("./app/routes/sport.routes");
const userRouter = require("./app/routes/user.routes");
const authRouter = require("./app/routes/auth.routes");
const CartRouter = require("./app/routes/cart.routes");
const OrderRouter = require("./app/routes/order.routes");
const errorHandler = require("./app/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/sports", sportRouter);
app.use("/api/users", userRouter);
app.use("/api/carts", CartRouter);
app.use("/api/orders", OrderRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sports Store API!" });
});

app.use(errorHandler);

module.exports = app;
