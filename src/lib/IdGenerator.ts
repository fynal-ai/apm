import { v4 as uuidv4 } from "uuid";
import shortuuid from "short-uuid";
export default function IdGenerator() {
	return uuidv4();
}

export function shortId() {
	return shortuuid.generate();
}
