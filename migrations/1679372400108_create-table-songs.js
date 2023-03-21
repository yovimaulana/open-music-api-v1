/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        title: {
            type: 'VARCHAR(255)',
            notNull: true
        },
        year: {
            type: 'int',
            notNull: true
        },
        genre: {
            type: 'VARCHAR(255)',
            notNull: true
        },
        performer: {
            type: 'VARCHAR(255)',
            notNull: true
        },
        duration: {
            type: 'int',
            notNull: false
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: false
        },
        created_at: {
            type: 'TEXT',
            notNull: true
        },
        updated_at: {
            type: 'TEXT',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('songs')
};
