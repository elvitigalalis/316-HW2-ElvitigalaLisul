import React, { Component } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);
        this.state = this.initStateFromSong(props.song);
    }

    initStateFromSong(song) {
        return song
            ? { title: song.title, artist: song.artist, year: song.year, youTubeId: song.youTubeId }
            : { title: "", artist: "", year: "", youTubeId: "" };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.song && nextProps.song.title !== prevState.title) {
            return {
                title: nextProps.song.title,
                artist: nextProps.song.artist,
                year: nextProps.song.year,
                youTubeId: nextProps.song.youTubeId
            };
        }
        return null;
    }

    updateField = (field, value) => {
        this.setState({ [field]: value });
    };

    confirmChanges = () => {
        const updated = { 
            title: this.state.title,
            artist: this.state.artist,
            year: this.state.year,
            youTubeId: this.state.youTubeId
        };
        this.props.editSongConfirmCallback(updated);
    };

    render() {
        const { isVisible, hideEditSongModalCallback } = this.props;
        const modalStyle = `modal ${isVisible ? "is-visible" : ""}`;

        return (
            <div 
                className={modalStyle} 
                id="edit-song-modal" 
                data-animation="slideInOutLeft"
            >
                <div className="modal-root" id="edit-song-root">
                    <div className="modal-north">Edit Song</div>

                    <div className="modal-center">
                        <label className="modal-prompt" htmlFor="edit-song-title">Title:</label>
                        <input
                            id="edit-song-title"
                            className="modal-textfield"
                            type="text"
                            value={this.state.title}
                            onChange={(e) => this.updateField("title", e.target.value)}
                        />

                        <label className="modal-prompt" htmlFor="edit-song-artist">Artist:</label>
                        <input
                            id="edit-song-artist"
                            className="modal-textfield"
                            type="text"
                            value={this.state.artist}
                            onChange={(e) => this.updateField("artist", e.target.value)}
                        />

                        <label className="modal-prompt" htmlFor="edit-song-year">Year:</label>
                        <input
                            id="edit-song-year"
                            className="modal-textfield"
                            type="text"
                            value={this.state.year}
                            onChange={(e) => this.updateField("year", e.target.value)}
                        />

                        <label className="modal-prompt" htmlFor="edit-song-id">YouTube Id:</label>
                        <input
                            id="edit-song-id"
                            className="modal-textfield"
                            type="text"
                            value={this.state.youTubeId}
                            onChange={(e) => this.updateField("youTubeId", e.target.value)}
                        />
                    </div>

                    <div className="modal-south">
                        <button 
                            id="edit-song-confirm-button" 
                            className="modal-button"
                            onClick={this.confirmChanges}
                        >
                            Confirm
                        </button>
                        <button 
                            id="edit-song-cancel-button" 
                            className="modal-button"
                            onClick={hideEditSongModalCallback}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}