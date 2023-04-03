/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('user_album_likes', 'fk_user_album_likes.users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
    pgm.addConstraint('user_album_likes', 'fk_user_album_likes.albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.users.id')
    pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.albums.id')
};
