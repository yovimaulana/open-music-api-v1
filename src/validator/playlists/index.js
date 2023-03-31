const InvariantError = require("../../exceptions/InvariantError")
const { PlaylistPayloadSchema, PlaylistSongPayloadSchema, DeletePlaylistSongPayloadSchema } = require("./schema")

const PlaylistValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistPayloadSchema.validate(payload)

        if(validationResult.error) throw new InvariantError(validationResult.error.message)
    },
    validatePlaylistSongPayload: (payload) => {
        const validationResult = PlaylistSongPayloadSchema.validate(payload)

        if(validationResult.error) throw new InvariantError(validationResult.error.message)
    },
    validateDeletePlaylistSongPayload: (payload) => {
        const validationResult = DeletePlaylistSongPayloadSchema.validate(payload)

        if(validationResult.error) throw new InvariantError(validationResult.error.message)
    }
}

module.exports = PlaylistValidator