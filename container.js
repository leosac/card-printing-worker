import RenderService from './services/RenderService';

const Cabin = require('cabin');
const logger = new Cabin();

const Container = require("typedi").Container;

Container.set('logger', logger);
Container.set('render', new RenderService(Container));

module.exports = Container;