const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsHandler {
    constructor(playlistSongsService, playlistsService, validator) {
        this._playlistSongsService = playlistSongsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
        this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
        this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
    }

    // Kriteria 1 : API dapat menyimpan lagu di playlist

    async postPlaylistSongHandler(request, h) {
        try {
            this._validator.validatePlaylistSongsPayload(request.payload);
            const { id: credentialId } = request.auth.credentials;
            const { songId } = request.payload;
            const { playlistId } = request.params;

            await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
            await this._playlistSongsService.addPlaylistSong({
                playlistId, songId,
            });

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
            });

            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    // Kriteria 2 : API dapat menampilkan seluruh lagu di playlist

    async getPlaylistSongsHandler(request, h) {
        try {
            const { playlistId } = request.params;
            const { id: userId } = request.auth.credentials;

            await this._playlistsService.verifyPlaylistsAccess(playlistId, userId);
            const songs = await this._playlistSongsService.getPlaylistSongs(userId, playlistId);
            return {
                status: 'success',
                data: {
                    songs: songs.map((pls) => ({
                        id: pls.id,
                        title: pls.title,
                        performer: pls.performer,
                    })),
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    // Kriteria 5 : API dapat menghapus data lagu dari playlist

    async deletePlaylistSongByIdHandler(request, h) {
        try {
            this._validator.validatePlaylistSongsPayload(request.payload);
            const { id: credentialId } = request.auth.credentials;
            const { songId } = request.payload;
            const { playlistId } = request.params;

            await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
            await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);
            return {
                status: 'success',
                message: 'Lagu berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = PlaylistSongsHandler;
