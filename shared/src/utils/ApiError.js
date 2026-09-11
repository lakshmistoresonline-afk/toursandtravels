export class ApiError extends Error {
	statusCode;
	ok;
	details = [];
	message;
	/**
	 * @param message     Human‐readable message (default: "Internal Server Error")
	 * @param statusCode  HTTP‐style status (default: 500)
	 * @param details     Optional array of extra error details
	 */
	constructor(message = "Internal Server Error", statusCode = 500, details = []) {
		super(message);
		Object.setPrototypeOf(this, ApiError.prototype);
		this.message = message;
		this.name = "ApiError";
		this.statusCode = statusCode;
		this.ok = false;
		this.details.push({ stack: this.stack ?? "" }, ...details);
	}
}
