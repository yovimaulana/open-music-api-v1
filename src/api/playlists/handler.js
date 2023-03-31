class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
        this.getPlaylistHandler = this.getPlaylistHandler.bind(this)
        this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this)
        this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this)
        this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this)
        this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this)
        this.getPlaylistSongActivityHandler = this.getPlaylistSongActivityHandler.bind(this)
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload)
        const {name} = request.payload
        const {id: credentialId} = request.auth.credentials        

        const playlistId = await this._service.addPlaylist({name, credentialId})
        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId
            }
        })
        response.code(201)
        return response
    }

    async getPlaylistHandler(request) {
        const {id: credentialId} = request.auth.credentials

        const playlists = await this._service.getPlaylists(credentialId)
        return {
            status: 'success',
            data: {
                playlists
            }
        }
    }    

    async postPlaylistSongHandler(request, h) {

        this._validator.validatePlaylistSongPayload(request.payload)

        const {songId} = request.payload
        const {id: playlistId} = request.params
        const {id: credentialId} = request.auth.credentials

        await this._service.verifyPlaylistAccess(playlistId, credentialId)        
        await this._service.addPlaylistSong(playlistId, songId)
        await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, 'add')

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambahkan song ke dalam playlist',          
        })
        response.code(201)
        return response       
    }

    async getPlaylistSongHandler(request) {

        const {id: playlistId} = request.params
        const {id: credentialId} = request.auth.credentials

        await this._service.verifyPlaylistAccess(playlistId, credentialId)   
        const playlist = await this._service.getPlaylistSong(playlistId)

        return {
            status: 'success',
            data: {
                playlist
            }
        }

    }

    async deletePlaylistSongHandler(request) {

        this._validator.validateDeletePlaylistSongPayload(request.payload)

        const {songId} = request.payload
        const {id: playlistId} = request.params
        const {id: credentialId} = request.auth.credentials

        await this._service.verifyPlaylistAccess(playlistId, credentialId)   
        await this._service.deletePlaylistSong(playlistId, songId)
        await this._service.addPlaylistSongActivity(playlistId, songId, credentialId, 'delete')

        return {
            status: 'success',
            message: 'Berhasil menghapus song dari playlist'
        }
    }

    async deletePlaylistHandler(request) {
        const {id: playlistId} = request.params
        const {id: credentialId} = request.auth.credentials

        await this._service.verifyPlaylistOwner(playlistId, credentialId)   
        await this._service.deletePlaylist(playlistId)

        return {
            status: 'success',
            message: 'Berhasil menghapus playlist'
        }
    }

    async getPlaylistSongActivityHandler(request) {
        const {id: playlistId} = request.params
        const {id: credentialId} = request.auth.credentials

        await this._service.verifyPlaylistAccess(playlistId, credentialId)   

        return {
            status: 'success',
            data: await this._service.getPlaylistSongActivity(playlistId)
        }
    }
}

module.exports = PlaylistsHandler