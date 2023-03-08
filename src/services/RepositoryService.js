const path = require('path');
const fs = require('fs');

class RepositoryService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');

        this.load();
    }

    static getTemplates(folder) {
        const templates = [];
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(file => {
                if (path.extname(file).toLowerCase() === ".json") {
                    const fullfile = path.join(folder, file);
                    const json = fs.readFileSync(fullfile, { encoding: 'utf8' });
                    const tpl = JSON.parse(json);
                    templates.push(tpl);
                }
            });
        } else {
            throw new Error("The repository folder `" + folder + "` doesn't exist.");
        }
        return templates;
    }

    load() {
        try {
            this.templates = RepositoryService.getTemplates(process.env.TEMPLATE_REPOSITORY);
        } catch(error) {
            this.logger.error(error);
        }
    }

    get(name) {
        if (this.templates && this.templates.length > 0) {
            return this.templates.find(tpl => tpl.name.toLowerCase() === name.toLowerCase());
        } else {
            this.logger.error("The template list is not initialized or empty.");
            return undefined;
        }
    }

    getAll() {
        return this.templates.map(t => t.name);
    }
}

module.exports = RepositoryService;