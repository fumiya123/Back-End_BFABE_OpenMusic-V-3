const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._songs = [];
    }

    addSong({
        title,
        year,
        performer,
        genre,
        duration,
    }) {
        const awal = 'song-';
        const akhir = nanoid(16);
        const songId = awal + akhir;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const newSong = {
            title, year, performer, genre, duration, songId, createdAt, updatedAt,
        };

        this._songs.push(newSong);

        const isSuccess = this._songs.filter((song) => song.songId === songId).length > 0;

        if (!isSuccess) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return songId;
    }

    getSongs() {
        return this._songs;
    }

    getSongById(songId) {
        const song = this._songs.filter((s) => s.id === songId)[0];
        if (!song) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return song;
    }

    editSongById(songId, {
        title,
        year,
        performer,
        genre,
        duration,
    }) {
        const index = this._songs.findIndex((song) => song.songId === songId);

        if (index === -1) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }

        const updatedAt = new Date().toISOString();

        this._songs[index] = {
            ...this._songs[index],
            title,
            year,
            performer,
            genre,
            duration,
            updatedAt,
        };
    }

    deleteSongById(songId) {
        const index = this._songs.findIndex((song) => song.songId === songId);
        if (index === -1) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
        this._songs.splice(index, 1);
    }
}

module.exports = SongsService;
