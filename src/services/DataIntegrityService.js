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
        if (!signature) {
            return false;
        }
        
        return crypto.verify("SHA256", this.prepareData(data), process.env.DATA_INTEGRITY_KEY, signature);
    }

    prepareData(data) {
        return JSON.stringify(data, Object.keys(data).sort());
    }
}

module.exports = DataIntegrityService;