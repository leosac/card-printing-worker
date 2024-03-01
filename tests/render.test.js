const supertest = require('supertest');
const app = require('../src/app');
const path = require('path');
const RepositoryService = require('../src/services/RepositoryService');

describe('Render Endpoint', () => {
    if (!process.env.TEMPLATE_REPOSITORY) {
        process.env.TEMPLATE_REPOSITORY = path.join(__dirname, '../repository');
    }
    const templates = RepositoryService.getTemplates(process.env.TEMPLATE_REPOSITORY);
    templates.forEach(tpl => {
        it('POST /render/image should generate a png | ' + tpl.id, async () => {
            await supertest(app).post('/render/image')
                .send({
                    ...tpl.content,
                    format: "png"
                })
                .expect(200)
                .expect(res => {
                    expect(res.type).toEqual(expect.stringContaining('image/png'));
                });
        });
    });
});