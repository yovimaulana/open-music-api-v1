/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

    // add temporary albums
    pgm.sql("insert into albums (id, name, year, created_at, updated_at) values ('old_album', 'old_album', '1999', '-', '-')")

    // update value column album_id from table songs where album_id is null
    pgm.sql("update songs set album_id = 'old_album' where album_id is null")

    // add foreign key to column album_id from column id - table albums
    pgm.addConstraint('songs', 'fk_songs.album_songs.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    // delete constraint fk_songs.album_songs.id from table songs
    pgm.dropConstraint('songs', 'fk_songs.album_songs.id')

    // update column album_id = null
    pgm.sql("update songs set album_id = null where album_id = 'old_album'")

    // delete temporary user
    pgm.sql("delete from albums where id='old_album'")
};
