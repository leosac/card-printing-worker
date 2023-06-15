const path = require('path');
const fs = require('fs');
const uuid = require("uuid");
var sanitize = require("sanitize-filename");

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
        const templates = [];
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(file => {
                var fpath = path.parse(file);
                if (fpath.ext.toLowerCase() === ".json") {
                    const fullfile = path.join(folder, file);
                    const json = fs.readFileSync(fullfile, { encoding: 'utf8' });
                    const tpl = JSON.parse(json);
                    templates.push({ id: fpath.name.toLowerCase(), content: tpl });
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
                this.templates = [];
            }
        } catch(error) {
            this.logger.error(error);
        }
    }

    store(template, templateId) {
        if (templateId === undefined) {
            templateId = uuid.v4();
        } else {
            templateId = sanitize(templateId);
        }
        if (this.folder !== null) {
            if (fs.existsSync(this.folder)) {
                const fullfile = path.join(this.folder, templateId + '.json');
                fs.writeFileSync(fullfile, JSON.stringify(template));
            } else {
                throw new Error("The repository folder `" + this.folder + "` doesn't exist.");
            }
        }
        this.templates.push({ id: templateId.toLowerCase(), content: template});
        return templateId;
    }

    get(templateId) {
        if (this.templates && this.templates.length > 0) {
            const tpl = this.templates.find(t => t.id == templateId.toLowerCase());
            if (tpl !== undefined) {
                return tpl.content;
            }
        } else {
            this.logger.error("The template list is not initialized or empty.");
        }

        return undefined;
    }

    getFields(templateId) {
        const template = this.get(templateId);
        if (template === null) {
            return undefined;
        }

        let fields = [];
        if (template.sides.front) {
            fields = fields.concat(this.getFieldsFromCardSide(template.sides.front));
        }
        if (template.sides.back) {
            fields = fields.concat(this.getFieldsFromCardSide(template.sides.back));
        }
        return fields;
    }

    getFieldsFromCardSide(side) {
        return side.fields.filter(f => f.name !== undefined && f.name !== "").map(f => ({
            name: f.name,
            type: this.normalizeWorkerType(f.type),
            value: f.value
        }));
    }

    normalizeWorkerType(type) {
        return type;
    }

    getAllIds() {
        return this.templates.map(t => t.id);
    }
}

module.exports = RepositoryService;