export const db = {
	users: new Map(),
	refreshTokens: new Map(),
	colors: new Set( [ "Red", "Green", "Blue" ] ),
}

db.users.set( "najimov", {
	username: "najimov",
	password: "$argon2id$v=19$m=65536,t=3,p=4$O1BSxPy/O2XbB5ZMdzhJbQ$Z3zeCp9QsRnr5O/C9DH1JNWQUJAkKFnEfUR64xSRvuw",
} )
