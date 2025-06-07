import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoute from "./routes/sales.js";

/* Data Imports */
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
} from "./data/index.js";

/* CONFIGURATION */
dotenv.config();
const app = express();

/* Environment Validation */
const requiredEnvVars = ["MONGO_URI"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

/* Middlewares */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://35.154.114.64", // Your production frontend
    "http://localhost:3000", // Local development
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

/* ROUTES */
const API_PREFIX = "/api";
app.use(`${API_PREFIX}/client`, clientRoutes);
app.use(`${API_PREFIX}/general`, generalRoutes);
app.use(`${API_PREFIX}/management`, managementRoutes);
app.use(`${API_PREFIX}/sales`, salesRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0"; // Bind to all network interfaces

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });

    /* ONE-TIME DATA INSERTION - COMMENTED OUT BY DEFAULT */
    /*
    const insertData = async () => {
      try {
        await Product.insertMany(dataProduct);
        await ProductStat.insertMany(dataProductStat);
        await User.insertMany(dataUser);
        await Transaction.insertMany(dataTransaction);
        await OverallStat.insertMany(dataOverallStat);
        await AffiliateStat.insertMany(dataAffiliateStat);
        console.log('Data successfully inserted');
      } catch (err) {
        console.error('Error inserting data:', err);
      }
    };
    // insertData(); // Uncomment this line to insert data
    */

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
