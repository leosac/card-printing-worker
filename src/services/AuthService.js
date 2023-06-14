const jwt = require("jsonwebtoken");

class AuthService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    authenticate(application, apikey, context) {
        if (!process.env.API_KEY || !process.env.SECRET_KEY) {
            throw new Error("Authentication is not enabled. SECRET_KEY and API_KEY variables are required.");
        }
        if (apikey !== process.env.API_KEY) {
            this.logger.error("Authentication failed. Wrong API_KEY.");
            return undefined;
        }
        return jwt.sign(
            { application: application, context: context },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );
    }

    authenticateToken(req, res, next) {
        if (!process.env.API_KEY || !process.env.SECRET_KEY) {
            next();
        } else {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]

            if (token == null) return res.sendStatus(401)
            jwt.verify(token, process.env.SECRET_KEY, (err, client) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
                req.client = client;
                next();
            });
        }
    }

    checkGlobalPermission(req, res, next) {
        if (!process.env.API_KEY || !process.env.SECRET_KEY) {
            next();
        } else {
            // authenticateToken should have been called first
            if (!req.client) {
                return res.sendStatus(403);
            }
            // If a context is assigned to the token, then the token can only be used
            // for actions on the associated queue items.
            if (req.client.context !== undefined) {
                return res.sendStatus(403);
            }

            next();
        }
    }

    checkQueuePermission(req, item) {
        if (!process.env.API_KEY || !process.env.SECRET_KEY) {
            return true;
        } else {
            // authenticateToken should have been called first
            if (!req.client) {
                return false;
            }
            return (req.client.context === undefined || item.context === req.client.context);
        }
    }
}

module.exports = AuthService;