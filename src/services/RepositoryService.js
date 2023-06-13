const path = require('path');
const fs = require('fs');
const uuid = require("uuid");

/**
 * Basic implementation of a repository service.
 * This works only for worker instance with short lifetime or few templates.
 * More performant/robust implementation would be required otherwise.
 */
class RepositoryService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
        this.folder = process.env.TEMPLATE_REPOSITORY;
        this.load();
    }

    static getTemplates(folder) {
        const templates = {};
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(file => {
                var fpath = path.parse(file);
                if (fpath.ext.toLowerCase() === ".json") {
                    const fullfile = path.join(folder, file);
                    const json = fs.readFileSync(fullfile, { encoding: 'utf8' });
                    const tpl = JSON.parse(json);
                    templates[fpath.name.toLowerCase()] = tpl;
                }
            });
        } else {
            throw new Error("The repository folder `" + folder + "` doesn't exist.");
        }
        return templates;
    }

    load() {
        try {
            if (this.folder !== undefined) {
                this.templates = RepositoryService.getTemplates(this.folder);
            } else {
                this.templates = {};
            }
        } catch(error) {
            this.logger.error(error);
        }
    }

    store(template) {
        const templateId = uuid.v4();
        if (this.folder !== null) {
            if (fs.existsSync(folder)) {
                const fullfile = path.join(this.folder, templateId + '.json');
                fs.writeFileSync(fullfile, template);
            } else {
                throw new Error("The repository folder `" + folder + "` doesn't exist.");
            }
        }
        this.templates[templateId.toLowerCase()] = template;
        return templateId;
    }

    get(name) {
        if (this.templates && this.templates[name.toLowerCase()] !== undefined) {
            return this.templates[name.toLowerCase()];
        } else {
            this.logger.error("The template list is not initialized or empty.");
            return undefined;
        }
    }

    getAll() {
        return Object.keys(this.templates);
    }
}

module.exports = RepositoryService;