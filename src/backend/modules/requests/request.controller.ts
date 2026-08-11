import type { RequestHandler } from "express";
import {logger} from '../../utils/logger.js';
import type { RequestState, RequestLevel } from "../../db/schema/requests.js" 
import * as requestService from './request.service.js';

export const createRequest: RequestHandler = async (req, res,next) => {

    try {

        if (!req.user){
            logger.warn("create_request")
            return res.status(401).send()
        }

        const appId: string = req.body.appId;
        const accessLevel: "READ" | "WRITE" = req.body.level;
        const userId = req.user.id;

        requestService.createRequest(userId,appId,accessLevel)

        res.status(201).send()
        
        
    } catch (error) {
        next(error);
    }
};

export const getRequest: RequestHandler = async (req, res,next) => {

    try {

        if (!req.user){
            logger.warn("get_request")
            return res.status(401).send()
        }

        const userId = req.user.id; // id of the user who made the HTTP request
        const userRole = req.user.role; // role of the user who made the HTTP request

        // filter params
        const requesterId = req.query.requesterId;
        const level = req.query.level;
        const appId = req.query.appId;
        const state = req.query.state;

        if (requesterId !== undefined && typeof requesterId !== "string") {
            res.status(400).json({
                message: "Invalid requesterId",
            });
            return;
        }

        if (level !== undefined && typeof level !== "string") {
            res.status(400).json({
                message: "Invalid request level",
            });
            return;
        }

        if (appId !== undefined && typeof appId !== "string") {
            res.status(400).json({
                message: "Invalid appId",
            });
            return;
        }

        if (state !== undefined && typeof state !== "string") {
            res.status(400).json({
                message: "Invalid state",
            });
            return;
        }

        const requests = await requestService.getRequests(userId,userRole,{
            requesterId,
            level: level as RequestLevel | undefined,
            appId,
            state: state as RequestState | undefined,
        });

        res.json(requests);
        
        
    } catch (error) {
        next(error);
    }
};

export const decideRequest: RequestHandler = async (req, res,next) => {

    try {

        if (!req.user){
            logger.warn("get_request")
            return res.status(401).send()
        }

        const { requestId } = req.params;
        const { state } = req.body;

        if (typeof requestId !== "string"){
            res.status(400).json({
                message: "Invalid request id",
            });
            return;
        }

        if (state !== "APPROVED" && state !== "REJECTED") {
            res.status(400).json({
                message: "State must be APPROVED or REJECTED",
            });
            return;
        }

        const request = await requestService.updateDecision(
            requestId,
            state,
            req.user.id
        );

        res.status(200).json(request);
        
        
    } catch (error) {
        next(error);
    }
};