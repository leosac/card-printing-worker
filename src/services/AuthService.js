const jwt = require("jsonwebtoken");

class AuthService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    authenticate(application, apikey) {
        if (!process.env.API_KEY || !process.env.SECRET) {
            throw new Error("Authentication is not enabled. SECRET and API_KEY variables are required.");
        }
        if (apikey !== process.env.API_KEY) {
            return undefined;
        }
        return jwt.sign(
            { application: application },
            secret,
            { expiresIn: "1h" }
        );
    }

    authenticateToken(req, res, next) {
        if (!process.env.API_KEY || !process.env.SECRET) {
            next();
        } else {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]

            if (token == null) return res.sendStatus(401)
            jwt.verify(token, process.env.SECRET, (err, client) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
                req.client = client;
                next();
            });
        }
    }
}

module.exports = AuthService;