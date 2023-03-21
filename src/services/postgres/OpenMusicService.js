const {nanoid} = require('nanoid')
const {Pool} = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const {songDBToModel, albumDBToModel} = require('../../utils')


class OpenMusicService {
    constructor() {
        this._pool = new Pool()
    }

    async addAlbum({name, year}) {
        const id = nanoid(16)
        const createdAt = new Date().toISOString()
        const updatedAt = createdAt

        const query = {
            text: 'insert into albums values($1, $2, $3, $4, $5) returning id',
            values: [id, name, year, createdAt, updatedAt]
        }

        const result = await this._pool.query(query)

        if(!result.rows[0].id) throw new InvariantError('Album gagal ditambahkan')

        return result.rows[0].id
    }

    async getAlbumById(id) {
        const query = {
            text: 'select * from albums where id = $1',
            values: [id]
        }

        const querySong ={
            text: 'select id, title, performer from songs where album_id = $1',
            values: [id]
        }

        const result = await this._pool.query(query)
        const resultSong = await this._pool.query(querySong)

        if(!result.rows.length) throw new NotFoundError('Album tidak ditemukan')

        const albumSelected = result.rows.map(albumDBToModel)[0]
        albumSelected['songs'] = resultSong.rows.map(songDBToModel)

        return albumSelected
    }

    async editAlbumById(id, {name, year}) {
        const updatedAt = new Date().toISOString()
        const query = {
            text: 'update albums set name = $1, year = $2, updated_at = $3 where id = $4 returning id',
            values: [name, year, updatedAt, id]
        }
        const result = await this._pool.query(query)
        if(!result.rows.length) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'delete from albums where id = $1 returning id',
            values: [id]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }

    async addSong({title, year, genre, performer, duration, albumId}) {
        const id = nanoid(16)       
        const createdAt = new Date().toISOString()
        const updatedAt = createdAt

        const query = {
            text: 'insert into songs values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id',
            values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt]
        }

        const result = await this._pool.query(query)

        if(!result.rows[0].id) throw new InvariantError('Song gagal ditambahkan')

        return result.rows[0].id
    }

    async getAllSong(title, performer) {        
        const query = {
            text: 'select id, title, performer from songs where title ilike $1 and performer ilike $2',
            values: [`%${title}%`, `%${performer}%`]
        }       
        const result = await this._pool.query(query)
         
        return result.rows.map(songDBToModel)
    }

    async getSongById(id) {
        const query = {
            text: 'select * from songs where id = $1',
            values: [id]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Song tidak ditemukan')

        return result.rows.map(songDBToModel)[0]
    }

    async editSongById(id, {title, year, genre, performer, duration, albumId}) {
        const updatedAt = new Date().toISOString()
        const query = {
            text: 'update songs set title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 where id = $8 returning id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id]
        }
        const result = await this._pool.query(query)
        if(!result.rows.length) throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan')
    }

    async deleteSongById(id) {
        const query = {
            text: 'delete from songs where id = $1 returning id',
            values: [id]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan')
    }
}

module.exports = OpenMusicService