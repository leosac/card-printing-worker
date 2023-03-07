const app = require('../app.js');
const supertest = require('supertest');
import RepositoryService from '../services/RepositoryService';

describe('Render Endpoint', () => {
    const templates = RepositoryService.getTemplates(process.env.TEMPLATE_REPOSITORY);
    templates.forEach(tpl => {
        it('POST /render/image should generate a png | ' + tpl.name, async () => {
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