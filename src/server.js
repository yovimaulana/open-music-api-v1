require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

// open music
const openMusic = require('./api/openmusic')
const OpenMusicService = require('./services/postgres/OpenMusicService')
const OpenMusicValidator = require('./validator/openmusic')

// users 
const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')

// playlist
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistValidator = require('./validator/playlists')


// authentications
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const AuthenticationsValidator = require('./validator/authentications')
const TokenManager = require('./tokenize/TokenManager')


// collaborations
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

// exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

// uploads
const uploads = require('./api/uploads')
const StorageService = require('./services/S3/StorageService')
const UploadsValidator = require('./validator/uploads')

// cache
const CacheService = require('./services/redis/CacheService')


const ClientError = require('./exceptions/ClientError')

const init = async () => {
    const cacheService = new CacheService()
    const collaborationsService = new CollaborationsService()
    const playlistsService = new PlaylistsService(collaborationsService)
    const openMusicService = new OpenMusicService(cacheService)
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const storageService = new StorageService()


    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt
        }
    ])

    // strategi autentifikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id
            }
        })
    })

    await server.register([
        {
            plugin: openMusic,
            options: {
                service: openMusicService,
                validator: OpenMusicValidator
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistValidator
            }
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator
            }
        },     
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator
            }
        },
        {
            plugin: _exports,
            options: {                
                ProducerService,
                playlistsService,
                validator: ExportsValidator,
            },
        },  
        {
            plugin: uploads,
            options: {
              storageService,
              openMusicService,
              validator: UploadsValidator,
            },
        }        
    ])

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

            console.log(response)
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