class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success < 400;
  }
}

//server status code ranges std.
// 100-199=> information response
// 200-299=>Success response
// 300-399=> redirection response
// 400-499=>client error
// 500-599=> server error

export { ApiResponse };
