const ExportsHandler = require("./handler")
const routes = require("./routes")

module.exports = {
    name: 'exports',
    version: '1.0.0',
    register: async (server, {ProducerService, playlistsService, validator}) => {
        const expotsHandler = new ExportsHandler(ProducerService, playlistsService, validator)
        server.route(routes(expotsHandler))
    }
}