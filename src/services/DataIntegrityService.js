const crypto = require('crypto');

class DataIntegrityService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    check(data, signature) {
        if (!process.env.DATA_INTEGRITY_ENABLED) {
            return true;
        }
        if (!signature || !process.env.DATA_INTEGRITY_KEY) {
            return false;
        }
        
        return crypto.verify("SHA256", this.flatData(data), process.env.DATA_INTEGRITY_KEY, Buffer.from(signature, "hex"));
    }

    flatData(data) {
        return JSON.stringify(data, Object.keys(data).sort());
    }
}

module.exports = DataIntegrityService;