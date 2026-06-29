import { Router } from "express";
import { authorization } from "../Middlewares/authorization.middleware.js";
import dashboardService from "./dashboard.service.js";
import { successResponse } from "../common/response/success.response.js";
import { authentication } from "../Middlewares/authentication.middleware.js";

const dashboardController = Router();


dashboardController.get("/dashboard", authentication(), authorization(), async (req, res) => {
    const result = await dashboardService.getStatistics()
    return successResponse({ res, data: result })

})

export default dashboardController