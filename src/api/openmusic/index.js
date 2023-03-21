const OpenMusicHandler = require('./handler')
const routes = require('./routes')

module.exports = {
    name: 'open-music-api-v1',
    version: '1.0.0',
    register: async(server, {service, validator}) => {
        const openMusicHandler = new OpenMusicHandler(service, validator)
        server.route(routes(openMusicHandler))
    }
}