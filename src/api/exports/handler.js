const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
    constructor(ProducerService, playlistsService, validator) {
        this._ProducerService = ProducerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
    }

    async postExportPlaylistsHandler(request, h) {
        try {
            this._validator.validateExportPlaylistsPayload(request.payload);

            const { playlistId } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);

            const message = {
                userId: request.auth.credentials.id,
                targetEmail: request.payload.targetEmail,
            };

            await this._ProducerService.sendMessage('export:playlists', JSON.stringify(message));

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda sedang kami proses',
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
}

module.exports = ExportsHandler;
