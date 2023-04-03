const {Pool} = require('pg')
const { nanoid } = require('nanoid')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')

class PlaylistsService {
    constructor(collaborationsService){
        this._pool = new Pool()
        this._collaborationsService = collaborationsService
    }

    async addPlaylist({name, credentialId}) {
        
        const id = `playlist-${nanoid(16)}`
        const query = {
            text: 'insert into playlists values ($1, $2, $3) returning id',
            values: [id, name, credentialId]
        }

        const result = await this._pool.query(query)
        if(!result.rows.length) throw new InvariantError('Playlist gagal ditambahkan')

        return result.rows[0].id

    }
    
    async getPlaylists(owner) {
        const query = {
            text: `select playlists.id, playlists.name, users.username from playlists join users on users.id = playlists.owner where playlists.owner = $1
                    union
                    select p.id, p.name, u.username from collaborations c
                    join playlists p on c.playlist_id = p.id
                    join users u on u.id = p.owner
                    where c.user_id = $1
                `,
            values: [owner]
        }

        const result = await this._pool.query(query)
        return result.rows
    }

    async addPlaylistSong(playlistId, songId) {

        // check if song exist
        const songQuery = {
            text: 'select * from songs where id = $1',
            values: [songId]
        }

        const resultSong = await this._pool.query(songQuery)
        if(!resultSong.rows.length) throw new NotFoundError('Song tidak ditemukan')


        // insert song to playlist
        const id = `ps-${nanoid(16)}`
        const query = {
            text: 'insert into playlist_songs values ($1, $2, $3) returning id',
            values: [id, playlistId, songId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('Song gagal ditambahkan kedalam Playlist')

        return result.rows[0].id

    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {            
            await this.verifyPlaylistOwner(playlistId, userId)        
        } catch (error) {
            if(error instanceof NotFoundError) throw error
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId)
            } catch (error) {
                throw new AuthorizationError('Anda tidak dapat mengakses resource ini')
            }
        }
    }

    async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'select * from playlists where id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan')

        const playlist = result.rows[0]

        if(playlist.owner !== owner) throw new AuthorizationError('Anda tidak dapat mengakses resource ini')                
    }

    async getPlaylistSong(playlistId) {
        const queryPlaylist = {
            text: 'select p.id, p.name, u.username from playlists p join users u on u.id = p.owner where p.id = $1',
            values: [playlistId]
        }

        const querySong = {
            text: 'select s.id, s.title, s.performer from playlist_songs ps join songs s on s.id = ps.song_id where ps.playlist_id = $1',
            values: [playlistId]
        }

        const resultPlaylist = await this._pool.query(queryPlaylist)
        const resultSong = await this._pool.query(querySong)

        if(!resultPlaylist.rows.length) throw new NotFoundError('Playlist tidak ditemukan')

        const playlist = resultPlaylist.rows[0]
        playlist['songs'] = resultSong.rows

        return playlist
    }

    async deletePlaylistSong(playlistId, songId) {
        const query = {
            text: 'delete from playlist_songs where playlist_id = $1 and song_id = $2 returning id',
            values: [playlistId, songId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Song gagal dihapus dari playlist. Id tidak temukan')
    }

    async deletePlaylist(playlistId) {
        const query = {
            text: 'delete from playlists where id = $1 returning id',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Gagal hapus playlist. Id tidak ditemukan')
    }

    async addPlaylistSongActivity(playlistId, songId, credentialId, action) {
        const id = `activity-${nanoid(16)}`
        const createdAt = new Date().toISOString()
        const query = {
            text: 'insert into playlist_song_activities values ($1, $2, $3, $4, $5, $6) returning id',
            values: [id, playlistId, songId, credentialId, action, createdAt]
        }

        const result = await this._pool.query(query)
        if(!result.rows.length) throw new InvariantError('Gagal menambahkan activity')
        return result.rows[0].id
    }

    async getPlaylistSongActivity(playlistId) {
        const queryActivity = {
            text: `select u.username, s.title, psa.action, psa.time from playlist_song_activities psa
                    left join songs s on psa.song_id = s.id
                    left join users u on u.id = psa.user_id
                    where psa.playlist_id = $1`,
            values: [playlistId]
        }
        const resultActivity = await this._pool.query(queryActivity)
        return {
            "playlistId": playlistId,
            "activities": resultActivity.rows
        }

    }

}

module.exports = PlaylistsService