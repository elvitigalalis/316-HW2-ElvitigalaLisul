import React, { Component } from 'react';

export default class DeleteListModal extends Component {
    getPlaylistName = () => {
        const { listKeyPair } = this.props;
        return listKeyPair ? listKeyPair.name : "";
    }

    render() {
        const { deleteListCallback, hideDeleteListModalCallback } = this.props;
        const playlistName = this.getPlaylistName();

        return (
            <div
                className="modal"
                id="delete-list-modal"
                data-animation="slideInOutLeft"
                tabIndex={-1}
            >
                <div className="modal-root" id="verify-delete-list-root">
                    <div className="modal-north">
                        Delete Playlist?
                    </div>

                    <div className="modal-center">
                        <div className="modal-center-content">
                            Are you sure you want to permanently delete&nbsp;
                            <span className="modal-highlight">{playlistName}</span>?
                        </div>
                    </div>

                    <div className="modal-south">
                        <input
                            type="button"
                            id="delete-list-confirm-button"
                            className="modal-button"
                            onClick={deleteListCallback}
                            value="Confirm"
                        />
                        <input
                            type="button"
                            id="delete-list-cancel-button"
                            className="modal-button"
                            onClick={hideDeleteListModalCallback}
                            value="Cancel"
                        />
                    </div>
                </div>
            </div>
        );
    }
}