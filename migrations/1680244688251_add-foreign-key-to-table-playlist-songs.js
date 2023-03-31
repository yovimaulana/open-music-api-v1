/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {    
    // add foreign key
    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    // delete constraint
    pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlists.id')
    pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.songs.id')
};
