/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlist_song_activities', {
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
        },
        user_id: {
            type: 'varchar(200)',
            notNull: true
        },
        action: {
            type: 'varchar(200)',
            notNull: true
        },
        time: {
            type: 'TEXT',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('playlist_song_activities')
};
