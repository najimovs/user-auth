import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import JWT from "jsonwebtoken"
import argon2 from "argon2"

const PORT = parseInt( process.env.PORT || "3000" )

const fastify = Fastify( { logger: true } )

fastify.register( cors )
fastify.register( cookie )

fastify.get( "/", () => ( { status: "OK" } ) )

fastify.post( "/signup", () => ( { status: "signup" } ) )
fastify.post( "/login", () => ( { status: "login" } ) )
fastify.post( "/refresh", () => ( { status: "refresh" } ) )
fastify.post( "/colors", () => ( { status: "colors" } ) )

fastify.listen( { port: PORT, host: "0.0.0.0" } )
