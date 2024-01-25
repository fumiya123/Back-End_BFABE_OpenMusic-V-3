/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        owner: {
            type: 'TEXT',
            notNull: true,
        },
    });

    // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('playlists');
    // menghapus constraint fk_notes.owner_users.id pada tabel playlist
    pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id');
};
