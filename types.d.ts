declare module "@hapi/hapi" {
	export interface Request {
		websocket(): any; // Replace 'any' with the actual type if you know it
	}
}
