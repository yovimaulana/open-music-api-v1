class UploadsHandler {
    constructor(storageService, openMusicService, validator) {
      this._storageService = storageService;
      this._openMusicService = openMusicService
      this._validator = validator;

      this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        const {cover} = request.payload        
        const{id: albumId} = request.params

        this._validator.validateImageHeaders(cover.hapi.headers);
        this._validator.validateImageSize(parseInt(request.headers['content-length']))            

        const filename = await this._storageService.writeFile(cover, cover.hapi)

        await this._openMusicService.updateCoverUrlALbum(filename, albumId)

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah'            
        })

        response.code(201)
        return response
    }
}

module.exports = UploadsHandler