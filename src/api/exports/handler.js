class ExportsHandler {
    constructor(ProducerService, playlistsService, validator) {
        this._ProducerService = ProducerService
        this._playlistsService = playlistsService
        this._validator = validator
        this.postExportsPlaylistSongHandler = this.postExportsPlaylistSongHandler.bind(this)
    }

    async postExportsPlaylistSongHandler(request, h) {

        this._validator.validateExportsPlaylistSongPayload(request.payload)

        const{id} = request.params
        const userId = request.auth.credentials.id
        const message = {
            userId: userId,
            targetEmail: request.payload.targetEmail,
            playlistId: id
        }


        await this._playlistsService.verifyPlaylistAccess(id, userId)        
        await this._ProducerService.sendMessage('export:playlist', JSON.stringify(message))

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses'
        })

        response.code(201)
        return response
    }
}

module.exports = ExportsHandler