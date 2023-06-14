const supertest = require('supertest');
const app = require('../src/app');
const RepositoryService = require('../src/services/RepositoryService');

describe('Render Endpoint', () => {
    const templates = RepositoryService.getTemplates(process.env.TEMPLATE_REPOSITORY);
    Object.keys(templates).forEach(tplId => {
        const tpl = templates[tplId];
        it('POST /render/image should generate a png | ' + tplId, async () => {
            await supertest(app).post('/render/image')
                .send({
                    ...tpl,
                    format: "png"
                })
                .expect(200)
                .expect(res => {
                    expect(res.type).toEqual(expect.stringContaining('image/png'));
                });
        });
    });
});