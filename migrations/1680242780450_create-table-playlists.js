/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlists', {
        id: {
            type: 'varchar(200)',
            primaryKey: true
        },
        name: {
            type: 'varchar(255)',
            notNull: true
        },
        owner: {
            type: 'varchar(200)',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('playlists')
};
