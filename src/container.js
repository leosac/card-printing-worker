module.exports = function(logger) {
    const AuthService = require('./services/AuthService');
    const DataIntegrityService = require('./services/DataIntegrityService');
    const RepositoryService = require('./services/RepositoryService');
    const QueueService = require('./services/QueueService');
    const RenderService = require('./services/RenderService');

    const Container = require('typedi').Container;

    Container.set('logger', logger);
    Container.set('auth', new AuthService(Container));
    Container.set('integrity', new DataIntegrityService(Container));
    Container.set('repository', new RepositoryService(Container));
    Container.set('queue', new QueueService(Container));
    Container.set('render', new RenderService(Container));

    return Container;
}