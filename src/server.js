require('dotenv').config()

const Hapi = require('@hapi/hapi')
const openMusic = require('./api/openmusic')
const OpenMusicService = require('./services/postgres/OpenMusicService')
const OpenMusicValidator = require('./validator/openmusic')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
    const openMusicService = new OpenMusicService()
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    await server.register({
        plugin: openMusic,
        options: {
            service: openMusicService,
            validator: OpenMusicValidator
        }
    })

    server.ext('onPreResponse', (request, h) => {
        const {response} = request

        if(response instanceof Error) {
            if(response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message
                })
                newResponse.code(response.statusCode)
                return newResponse
            }

            if(!response.isServer) {
                return h.continue
            }

            const newResponse = h.response({
                status: 'error',
                message: 'Terjadi kegagalan pada server kami'
            })

            newResponse.code(500)
            return newResponse
        }

        return h.continue
    })

    await server.start()
    console.log(`Server sedang berjalan pada ${server.info.uri}`)
}

init()