import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import JWT from "jsonwebtoken"
import argon2 from "argon2"
import { db } from "./db.js"

const PORT = parseInt( process.env.PORT || "3000" )
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET
const COOKIE_SECRET = process.env.COOKIE_SECRET

const fastify = Fastify( { logger: true } )

fastify.register( cors, {
	credentials: true,
} )
fastify.register( cookie, {
	secret: COOKIE_SECRET,
} )

fastify.get( "/", () => ( { status: "OK" } ) )

fastify.post( "/signup", () => ( { status: "signup" } ) )
fastify.post( "/login", async ( req, res ) => {

	const { username, password } = req.body

	if ( !db.users.has( username ) ) {

		return res.status( 401 ).send( {
			code: "APP_USERNAME_NOT_EXISTS",
		} )
	}

	const user = db.users.get( username )

	if ( !( await argon2.verify( user.password, password ) ) ) {

		return res.status( 401 ).send( {
			code: "APP_PASSWORD_INVALID",
		} )
	}

	const payload = {
		username: user.username,
	}

	const accessToken = JWT.sign( payload, JWT_ACCESS_TOKEN_SECRET, {
		expiresIn: 60 * 30,
	} )
	const refreshToken = JWT.sign( payload, JWT_REFRESH_TOKEN_SECRET, {
		expiresIn: 60 * 60 * 24 * 7,
	} )

	db.refreshTokens.set( username, refreshToken )

	res.setCookie( "refresh_token", refreshToken, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		signed: true,
	} )

	res.status( 201 ).send( {
		accessToken,
		refreshToken,
	} )
} )
fastify.post( "/refresh", ( req ) => {

	const refreshToken = req.unsignCookie( req.cookies.refresh_token )

	try {

		const payload = await JWT.verify( refreshToken, JWT_REFRESH_TOKEN_SECRET )

		const refreshTokenInDb = db.refreshTokens.get( payload.username )

		if ( !refreshTokenInDb || refreshTokenInDb !== refreshToken ) {

			return res.status( 401 ).send( {
				code: "APP_REFRESH_TOKEN_INVALID",
			} )
		}

		const accessToken = JWT.sign( payload, JWT_ACCESS_TOKEN_SECRET, {
			expiresIn: 60 * 30,
		} )

		return {
			accessToken,
		}
	}
	catch ( error ) {

		fastify.log.error( error )
	}
} )


fastify.post( "/colors", () => {

	return [ ...db.colors ]
} )

fastify.listen( { port: PORT, host: "0.0.0.0" } )
