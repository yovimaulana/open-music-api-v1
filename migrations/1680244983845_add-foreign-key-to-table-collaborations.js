/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // add constraint fk
    pgm.addConstraint('collaborations', 'fk_collaborations.playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
    pgm.addConstraint('collaborations', 'fk_collaborations.users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    // delete constraint
    pgm.dropConstraint('collaborations', 'fk_collaborations.playlists.id')
    pgm.dropConstraint('collaborations', 'fk_collaborations.users.id')
};
