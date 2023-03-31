/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('collaborations', {
        id: {
            type: 'varchar(200)',
            primaryKey: true
        },
        playlist_id: {
            type: 'varchar(200)',
            notNull: true
        },
        user_id: {
            type: 'varchar(200)',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('collaborations')
};
