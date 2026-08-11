import type { RequestHandler } from "express";
import * as authService from './auth.service.js';

export const registerUser: RequestHandler = async (req, res,next) => {

    try {
        const name: string = req.body.name;
        const password: string = req.body.password;
        const {accessToken, refreshToken} = await authService.registerUser(
            name,password
        );

        const refreshLifetime = process.env.REFRESH_TOKEN_LIFETIME_DAYS!;
        const refreshLifetimeMS = parseInt(refreshLifetime) * 24 * 60 * 60 * 1000; // convert days to milliseconds

        res.cookie("refreshToken",refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshLifetimeMS
        })

        res.status(201).json({accessToken: accessToken});
        
    } catch (error) {
        next(error);
    }
};

export const loginUser: RequestHandler = async (req, res,next) => {

    try {
        const username: string = req.body.name;
        const password: string = req.body.password;
        const {accessToken, refreshToken} = await authService.loginUser(
            username,password
        );

        const refreshLifetime = process.env.REFRESH_TOKEN_LIFETIME_DAYS!;
        const refreshLifetimeMS = parseInt(refreshLifetime) * 24 * 60 * 60 * 1000; // convert days to milliseconds

        res.cookie("refreshToken",refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshLifetimeMS
        })

        res.status(201).json({accessToken: accessToken});
        
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken: RequestHandler = async (req, res,next) => {

    try {
        const refreshToken: string = req.cookies.refreshToken;
        const {accessToken} = await authService.refreshAccessToken(
            refreshToken
        );

        res.status(201).json({accessToken: accessToken});
        
    } catch (error) {
        next(error);
    }
};