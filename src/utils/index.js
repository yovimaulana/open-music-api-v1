const albumDBToModel = ({id, name, year, created_at, updated_at}) => ({id, name, year, createdAt: created_at, updatedAt: updated_at})
const songDBToModel = ({id, title, year, genre, performer, duration, album_id, created_at, updated_at}) => ({
    id, title, year, genre, performer, duration, albumId: album_id, createdAt: created_at, updatedAt: updated_at
})
const mapUserDBToModel = (
    {
        id, username, password, fullname
    }
) => ({
    id, username, password, fullname: fullname
})

const mapPlaylistDbToModel = (
    {id, name, owner}
) => ({
    id, name, username: owner
})

module.exports = {albumDBToModel, songDBToModel, mapUserDBToModel, mapPlaylistDbToModel}