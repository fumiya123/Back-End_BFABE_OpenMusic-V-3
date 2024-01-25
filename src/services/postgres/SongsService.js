const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    // Kriteria 1 : API dapat menyimpan lagu

    async addSong({
        title, year, performer, genre, duration,
    }) {
        const songId = `song-${nanoid(16)}`;
        const insertedAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
            values: [songId, title, year, performer, genre, duration, insertedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    // Kriteria 2 : API dapat menampilkan seluruh lagu
    async getSongs() {
        const result = await this._pool.query('SELECT id, title, performer FROM songs');
        return result.rows.map(mapDBToModel);
    }

    // Kriteria 3 : API dapat menampilkan detail lagu
    async getSongById(songId) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    // Kriteria 4 : API dapat mengubah data lagu

    async editSongById(songId, {
        title, year, performer, genre, duration,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, updatedAt, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    // Kriteria 5 : API dapat menghapus data lagu

    async deleteSongById(songId) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;
