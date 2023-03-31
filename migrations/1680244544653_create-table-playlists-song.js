/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlist_songs', {
        id: {
            type: 'varchar(200)',
            primaryKey: true
        },
        playlist_id: {
            type: 'varchar(200)',
            notNull: true
        },
        song_id: {
            type: 'varchar(200)',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('playlist_songs')
};
