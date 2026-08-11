import type { RequestHandler } from "express";
import * as requestService from './request.service.js';

export const createRequest: RequestHandler = async (req, res,next) => {

    try {
        
        
    } catch (error) {
        next(error);
    }
};