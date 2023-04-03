const {nanoid} = require('nanoid')
const {Pool} = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const {songDBToModel, albumDBToModel} = require('../../utils')


class OpenMusicService {
    constructor(cacheService) {
        this._pool = new Pool()
        this._cacheService = cacheService
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

    async updateCoverUrlALbum(filename, albumId) {
        const query = {
            text: 'update albums set cover = $1 where id = $2 returning id',
            values: [filename, albumId]
        }

        const result = await this._pool.query(query)
        if(!result.rows.length) throw new NotFoundError('Gagal update cover album. Album tidak ditemukan')
    }    

    async postAlbumLike(albumId, userId) {     

        // check if album exist
        await this.getAlbumById(albumId)    
                
        // check if already hit like
        await this.checkAlbumLikeByUser(albumId, userId)
        
        const id = nanoid(16)
        // input like album
        const query = {
            text: 'insert into user_album_likes values ($1, $2, $3) returning id',
            values: [id, userId, albumId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('Gagal menyimpan like')        

        await this._cacheService.delete(`likes:${albumId}`); // remove cache 
        return result.rows[0].id
    }

    async checkAlbumLikeByUser(albumId, userId) {        
        const query = {
            text: 'select * from user_album_likes where user_id = $1 and album_id = $2',
            values: [userId, albumId]
        }

        const result = await this._pool.query(query)

        if(result.rows.length) throw new InvariantError('Album sudah anda sukai.')
    }   
    
    async getAlbumLike(albumId) {
        try {
            const result = await this._cacheService.get(`likes:${albumId}`)
            return {
                type: 'from-cache',
                total: result
            }
        } catch (error) {
            const query = {
                text: 'select count(*) total from user_album_likes where album_id = $1 group by album_id',
                values: [albumId]
            }
    
            const result = await this._pool.query(query)
            const total = result.rows[0].total

            // add to cache
            await this._cacheService.set(`likes:${albumId}`, total)
    
            return {
                type: 'from-db',
                total: total
            }
        }
        
    }

    async deleteAlbumLike(userId, albumId) {
        const query = {
            text: 'delete from user_album_likes where user_id = $1 and album_id = $2 returning id',
            values: [userId, albumId]
        }

        const result = await this._pool.query(query)
        
        if(!result.rows.length) throw new NotFoundError('Like gagal dihapus. Album like tidak ditemukan')        

        await this._cacheService.delete(`likes:${albumId}`); // remove cache 
    }
}

module.exports = OpenMusicService