const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    // Kriteria 1 : API dapat menyimpan Playlist

    async addPlaylist(
        name, userId,
    ) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    // Kriteria 2 : API dapat menampilkan seluruh Playlist
    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON playlists.owner = users.id
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    // Kriteria 5 : API dapat menghapus data Playlist
    async deletePlaylistById(playlistId) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistsOwner(playlistId, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        const playlists = result.rows[0];

        if (playlists.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistsAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistsOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;
