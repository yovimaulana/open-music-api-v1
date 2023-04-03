/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'varchar(200)',
            primaryKey: true
        },
        user_id: {
            type: 'varchar(200)',
            notNull: true
        },
        album_id: {
            type: 'varchar(200)',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('user_album_likes')
};
