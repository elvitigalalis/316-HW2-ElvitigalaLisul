import SongCard from './SongCard.jsx';
import React from "react";

export default class SongCards extends React.Component {
    render() {
        // UNPACK PROPS PASSED FROM APP
        const { currentList, 
                moveSongCallback, 
                editSongCallback,
                removeSongCallback,
                duplicateSongCallback } = this.props;

        // IF THERE'S NO LIST LOADED, SHOW EMPTY DIV
        if (currentList === null) {
            return (
                <div id="song-cards"></div>
            );
        }
        // OTHERWISE RENDER ALL SONG CARDS
        else {
            return (
                <div id="song-cards">
                    {
                        currentList.songs.map((song, index) => (
                            <SongCard
                                id={'song-card-' + (index+1)}
                                key={'song-card-' + (index+1)}
                                index={index}
                                song={song}
                                moveCallback={moveSongCallback}
                                editSongCallback={editSongCallback}
                                removeSongCallback={removeSongCallback}
                                duplicateSongCallback={duplicateSongCallback}
                            />
                        ))
                    }
                </div>
            );
        }
    }
}