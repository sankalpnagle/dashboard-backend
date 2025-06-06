import express from "express";
import {
  getProducts,
  getCustomers,
  getTransaction,
  getGeography,
} from "../controllers/client.js";

const router = express.Router();

router.get("/product", getProducts);
router.get("/customers", getCustomers);
router.get("/transactions", getTransaction);
router.get("/geography", getGeography);

export default router;
