import type { RequestHandler } from "express";
import * as authService from './auth.service.js';

export const registerUser: RequestHandler = async (req, res,next) => {

    try {
        const name: string = req.body.name;
        const password: string = req.body.password;
        const result = await authService.registerUser(
            name,password
        );

        const refreshLifetime = process.env.REFRESH_TOKEN_LIFETIME_DAYS!;
        const refreshLifetimeMS = parseInt(refreshLifetime) * 24 * 60 * 60 * 1000; // convert days to milliseconds

        const isProduction = process.env.NODE_ENV === 'production'

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: refreshLifetimeMS,
        })

        res.status(201).json({accessToken: result.accessToken, userInfo: result.userInfo});
        
    } catch (error) {
        next(error);
    }
};

export const loginUser: RequestHandler = async (req, res,next) => {

    try {
        const username: string = req.body.name;
        const password: string = req.body.password;
        const result = await authService.loginUser(
            username,password
        );

        const refreshLifetime = process.env.REFRESH_TOKEN_LIFETIME_DAYS!;
        const refreshLifetimeMS = parseInt(refreshLifetime) * 24 * 60 * 60 * 1000; // convert days to milliseconds
        
        const isProduction = process.env.NODE_ENV === 'production'

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: refreshLifetimeMS,
        })

        res.status(201).json({accessToken: result.accessToken,userInfo: result.userInfo});
        
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

export const getMe: RequestHandler = async (req, res,next) => {

    try {
        
        if (!req.user){
            return res.sendStatus(401)
        }

        return res.json({
            id: req.user.id,
            role: req.user.role,
            username: req.user.username
        })
        
    } catch (error) {
        next(error);
    }
};


export const logout: RequestHandler = async (req, res,next) => {

    try {
        
        const refreshToken = req.cookies.refreshToken

        if (refreshToken) {
            await authService.logout(refreshToken)
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        res.status(204).send()

    } catch (error) {
        next(error);
    }
};
