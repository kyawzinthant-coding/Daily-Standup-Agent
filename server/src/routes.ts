import { Router } from "express";
import healthRoutes from "./health";
import authRoutes from "./features/auth/auth.route";

const routes = Router();

routes.use("/", healthRoutes);

routes.use("/api/auth", authRoutes);

export default routes;
