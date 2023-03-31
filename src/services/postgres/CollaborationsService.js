const { nanoid } = require('nanoid')
const {Pool} = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
    constructor() {
        this._pool = new Pool()
    }

    async addCollaboration(playlistId, userId) {

        // check if user exist
        const queryUser = {
            text: 'select * from users where id = $1',
            values: [userId]
        }

        const resultUser = await this._pool.query(queryUser)
        if(!resultUser.rows.length) throw new NotFoundError('Gagal menambahkan kolaborasi. User tidak ditemukan.')

        const id = `collab-${nanoid(16)}`
        const query = {
            text: 'insert into collaborations values($1, $2, $3) returning id',
            values: [id, playlistId, userId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('Kolaborasi gagal ditambahkan')

        return result.rows[0].id
    }

    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'delete from collaborations where user_id = $1 and playlist_id = $2 returning id',
            values: [userId, playlistId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('Kolaborasi gagal dihapus')
    }

    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'select * from collaborations where playlist_id = $1 and user_id = $2',
            values: [playlistId, userId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('Kolaborasi gagal diverifikasi')        
    }
}

module.exports = CollaborationsService