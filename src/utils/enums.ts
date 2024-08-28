export enum Role {
    user = "user",
    admin = "admin",
    verifiedkennelowner = "verifiedkennelowner",
}

export enum StatusCode {
    success = 200,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    serverError = 500,
}