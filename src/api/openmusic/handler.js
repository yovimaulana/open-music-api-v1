class OpenMusicHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        this.postAlbumHandler = this.postAlbumHandler.bind(this)
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
        this.postSongHandler = this.postSongHandler.bind(this)
        this.getAllSongsHandler = this.getAllSongsHandler.bind(this)
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this)
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)        
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload)

        const {name, year} = request.payload
        const albumId = await this._service.addAlbum({name, year})

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambahkan album baru',
            data: {
                albumId
            }
        })

        response.code(201)
        return response
    }

    async getAlbumByIdHandler(request) {
        const {id} = request.params
        const album = await this._service.getAlbumById(id)
        return {
            status: 'success',
            data: {
                album
            }
        }
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload)
        const {id} = request.params
        await this._service.editAlbumById(id, request.payload)
        return {
            status: 'success',
            message: 'Album berhasil diperbarui'
        }
    }

    async deleteAlbumByIdHandler(request) {
        const {id} = request.params
        await this._service.deleteAlbumById(id)

        return {
            status: 'success',
            message: 'Berhasil menghapus album'
        }
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload)
        const {title, year, genre, performer, duration, albumId} = request.payload
        const songId = await this._service.addSong({title, year, genre, performer, duration, albumId})

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambahkan song baru',
            data: {
                songId
            }
        })

        response.code(201)
        return response
    }

    async getAllSongsHandler(request) {
        const title = request.query.title || ''
        const performer = request.query.performer || ''

        const songs = await this._service.getAllSong(title, performer)
        return {
            status: 'success',
            data: {
                songs
            }
        }
    }

    async getSongByIdHandler(request) {
        const {id} = request.params
        const song = await this._service.getSongById(id)
        return {
            status: 'success',
            data: {
                song
            }
        }
    }

    async putSongByIdHandler(request) {
        this._validator.validateSongPayload(request.payload)
        const {id} = request.params
        await this._service.editSongById(id, request.payload)
        return {
            status: 'success',
            message: 'Song berhasil diperbarui'
        }
    }

    async deleteSongByIdHandler(request) {
        const {id} = request.params
        await this._service.deleteSongById(id)

        return {
            status: 'success',
            message: 'Berhasil menghapus song'
        }
    }
}

module.exports = OpenMusicHandler