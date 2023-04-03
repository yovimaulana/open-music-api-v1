const InvariantError = require("../../exceptions/InvariantError")
const ExportsPlaylistSongPayloadSchema = require("./schema")

const ExportsValidator = {
    validateExportsPlaylistSongPayload: (payload) => {
        const validationResult = ExportsPlaylistSongPayloadSchema.validate(payload)

        if(validationResult.error) throw new InvariantError(validationResult.error.message)
    }
}

module.exports = ExportsValidator