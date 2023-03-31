const {Pool} = require('pg')
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapUserDBToModel } = require('../../utils')
const AuthencationError = require('../../exceptions/AuthenticationError')

class UsersService {
    constructor(){
        this._pool = new Pool()
    }

    async addUser({username, password, fullname}) {
        // TODO: verifikasi username, pastikan belum terdaftar
        await this.verifyNewUsername(username)

        // TODO: bila verifikasi lolos, masukan user ke database
        const id = `user-${nanoid(16)}`
        const hashedPassword = await bcrypt.hash(password, 10)
        const query = {
            text: 'insert into users values($1, $2, $3, $4) returning id',
            values: [id, username, hashedPassword, fullname]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new InvariantError('User gagal ditambahkan')

        return result.rows[0].id
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'select username from users where username = $1',
            values: [username]
        }

        const result = await this._pool.query(query)
        if(result.rows.length > 0) throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }

    async getUserById(userId) {
        const query = {
            text: 'select * from users where id = $1',
            values: [userId]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new NotFoundError('User tidak ditemukan')

        return result.rows.map(mapUserDBToModel)[0]
    }

    async getUsersByUsername(username) {
        const query = {
            text: 'select * from users where username like $1',
            values: [`%${username}%`]
        }

        const result = await this._pool.query(query)
        return result.rows
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'select * from users where username = $1',
            values: [username]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length) throw new AuthencationError('Kredensial yang Anda berikan salah')

        const {id, password: hashedPassword} = result.rows[0]
        const match = await bcrypt.compare(password, hashedPassword)

        if(!match) throw new AuthencationError('Kredensial yang Anda berikan salah')

        return id
    }


}

module.exports = UsersService