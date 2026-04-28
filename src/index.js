import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import JWT from "jsonwebtoken"
import argon2 from "argon2"
import { db } from "./db.js"

const PORT = parseInt( process.env.PORT || "3000" )
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET

const fastify = Fastify( { logger: true } )

fastify.register( cors )
fastify.register( cookie )

fastify.get( "/", () => ( { status: "OK" } ) )

fastify.post( "/signup", async ( req, res ) => {

	const { username, password } = req.body

	if ( db.users.has( username ) ) {

		return res.status( 400 ).send( {
			code: "APP_USERNAME_EXISTS",
		} )
	}

	const user = {
		username,
		password: await argon2.hash( password ),
	}

	const payload = {
		username,
	}

	db.users.set( username, user )

	const accessToken = JWT.sign( payload, JWT_ACCESS_TOKEN_SECRET, {
		expiresIn: 60 * 30,
	} )
	const refreshToken = JWT.sign( payload, JWT_REFRESH_TOKEN_SECRET, {
		expiresIn: 60 * 60 * 24 * 7,
	} )

	res.status( 201 ).send( {
		accessToken,
		refreshToken,
	} )
} )
fastify.post( "/login", () => ( { status: "login" } ) )
fastify.post( "/refresh", () => ( { status: "refresh" } ) )
fastify.post( "/colors", () => ( { status: "colors" } ) )

fastify.listen( { port: PORT, host: "0.0.0.0" } )
