/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

    // add temporary users
    pgm.sql("insert into users (id, username, password, fullname) values ('old_user', 'old_user', 'old_user', 'old_user')")

    // update value column owner from table playlists where owner is null
    pgm.sql("update playlists set owner = 'old_user' where owner is null")
    
    // add foreign key
    pgm.addConstraint('playlists', 'fk_playlists.users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    // delete constraint fk_songs.album_songs.id from table songs
    pgm.dropConstraint('playlists', 'fk_playlists.users.id')

    // update column owner = null
    pgm.sql("update playlists set owner = null where owner = 'old_user'")

    // delete temporary user
    pgm.sql("delete from users where id='old_user'")
};
