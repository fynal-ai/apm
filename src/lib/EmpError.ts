class EmpError extends Error {
	details: string;
	constructor(name: string, message: string, details: any = "") {
		super(message); // (1)
		this.name = name; // (2)
		this.details = "EmpError: " + details;
	}
}

export default EmpError;
