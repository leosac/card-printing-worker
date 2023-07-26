const uuid = require("uuid");

/**
 * Basic implementation of a queue per template service.
 * Should be improved.
 */
class QueueService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
        this.queue = [];
    }

    add(templateId, credential, context) {
        var item = {
            id: uuid.v4(),
            templateId: templateId,
            credential: credential,
            context: context,
            removing: false
        };
        this.queue.push(item);
        return item.id;
    }

    get(templateId, itemId) {
        return this.queue.find(q => q.templateId == templateId && q.id == itemId);
    }

    scheduleRemove(templateId, itemId, timeout) {
        var item = this.get(templateId, itemId);
        item.removing = true;
        setTimeout(() => {
            this.remove(templateId, itemId);
        }, timeout);
    }

    remove(templateId, itemId) {
        var index = this.queue.indexOf(q => q.templateId == templateId && q.id == itemId);
        if (index > -1) {
            this.queue.splice(index);
        }
    }
}

module.exports = QueueService;