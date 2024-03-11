const fs = require('fs');
const jwt = require("jsonwebtoken");

class AuthService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    static apikey = undefined;
    static secretkey = undefined;

    static isJWTSetup() {
        const isSetup = !((!process.env.API_KEY && !process.env.API_KEY_FILE) || (!process.env.SECRET_KEY && !process.env.SECRET_KEY_FILE));
        if (isSetup) {
            AuthService.cacheSecrets();
        }
        return isSetup;
    }

    static cacheSecrets() {
        if (!AuthService.apikey) {
            if (process.env.API_KEY) {
                AuthService.apikey = process.env.API_KEY;
            } else if (process.env.API_KEY_FILE) {
                AuthService.apikey = fs.readFileSync(process.env.API_KEY_FILE, { encoding: 'utf8' });
            }
        }
        if (!AuthService.secretkey) {
            if (process.env.SECRET_KEY) {
                AuthService.secretkey = process.env.SECRET_KEY;
            } else if (process.env.SECRET_KEY_FILE) {
                AuthService.secretkey = fs.readFileSync(process.env.SECRET_KEY_FILE, { encoding: 'utf8' });
            }
        }
    }

    authenticate(application, apikey, context) {
        if (!AuthService.isJWTSetup()) {
            this.logger.error("Authentication is not enabled. SECRET_KEY and API_KEY variables are required.");
            throw new Error("Authentication is not enabled. SECRET_KEY and API_KEY variables are required.");
        }
        if (apikey !== AuthService.apikey) {
            this.logger.error("Authentication failed. Wrong API_KEY.");
            return undefined;
        }
        return jwt.sign(
            { application: application, context: context },
            AuthService.secretkey,
            { expiresIn: "1h" }
        );
    }

    authenticateToken(req, res, next) {
        if (!AuthService.isJWTSetup()) {
            next();
        } else {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]

            if (token == null) return res.sendStatus(401)
            jwt.verify(token, AuthService.secretkey, (err, client) => {
                if (err) {
                    this.logger.error(err);
                    return res.sendStatus(403);
                }
                req.client = client;
                next();
            });
        }
    }

    checkGlobalPermission(req, res, next) {
        if (!AuthService.isJWTSetup()) {
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
        if (!AuthService.isJWTSetup()) {
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