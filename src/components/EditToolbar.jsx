import React from "react";

export default class EditToolbar extends React.Component {
  render() {
    const {
      canAddSong,
      canUndo,
      canRedo,
      canClose,
      undoCallback,
      redoCallback,
      closeCallback,
    } = this.props;
    let addSongClass = "toolbar-button";
    let undoClass = "toolbar-button";
    let redoClass = "toolbar-button";
    let closeClass = "toolbar-button";
    // if (canAddSong) addSongClass += " disabled";
    // if (canUndo) undoClass += " disabled";
    // if (canRedo) redoClass += " disabled";
    // if (canClose) closeClass += " disabled";
    return (
      <div id="edit-toolbar">
        <input
          type="button"
          id="add-song-button"
          value="+"
          className="toolbar-button"
          onClick={this.props.addSongCallback}
          disabled={!canAddSong}
        />
        <input
          type="button"
          id="undo-button"
          value="⟲"
          className="toolbar-button"
          onClick={undoCallback}
          disabled={!canUndo}
        />
        <input
          type="button"
          id="redo-button"
          value="⟳"
          className="toolbar-button"
          onClick={redoCallback}
          disabled={!canRedo}
        />
        <input
          type="button"
          id="close-button"
          value="✕"
          className="toolbar-button"
          onClick={closeCallback}
          disabled={!canClose}
        />
      </div>
    );
  }
}