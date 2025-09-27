import React from "react";

export default class SongCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
    };
  }

  handleDoubleClick = () => {
    const { editSongCallback, song, index } = this.props;
    if (editSongCallback) {
      editSongCallback(song, index);
    }
  };

  handleDragStart = (event) => {
    event.dataTransfer.setData("song", event.currentTarget.id);
    this.setState({ isDragging: true });
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };

  handleDrop = (event) => {
    event.preventDefault();
    let targetId = event.currentTarget.id.substring(
      event.currentTarget.id.indexOf("-") + 1
    );
    let sourceId = event.dataTransfer
      .getData("song")
      .substring(event.dataTransfer.getData("song").indexOf("-") + 1);

    this.setState({ isDragging: false });

    // ASK THE MODEL TO MOVE THE DATA
    this.props.moveCallback(sourceId, targetId);
  };

  handleDragEnd = () => {
    this.setState({ isDragging: false });
  };

  handleRemoveClick = (event) => {
    event.stopPropagation();
    this.props.removeSongCallback(this.props.index);
  };

  handleDuplicateClick = (event) => {
    event.stopPropagation();
    this.props.duplicateSongCallback(this.props.index);
  };

  getItemNum = () => {
    return this.props.id.substring("song-card-".length);
  };

  render() {
    const { song } = this.props;
    let num = this.getItemNum();
    let itemClass = this.state.isDragging ? "song-card dragging" : "song-card";

    return (
      <div
        id={"song-" + num}
        className={itemClass}
        onDoubleClick={this.handleDoubleClick}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        onDragEnd={this.handleDragEnd}
        draggable="true"
      >
        <span>{num + "."}</span>
        {"\u00A0"}
        <a
          href={`https://www.youtube.com/watch?v=${song.youTubeId}`}
          className="song-card-title"
          target="_blank"
          rel="noreferrer"
        >
          {song.title}
        </a>
        {"\u00A0"}
        <span className="song-card-year">({song.year})</span><span className="song-card-by">{"\u00A0by"}</span>
        {"\u00A0"}
        <span className="song-card-artist">{song.artist}</span>
        <div className="button-group">
          <input
            type="button"
            id={"delete-song-" + num}
            className="song-card-button"
            onClick={this.handleRemoveClick}
            value="🗑"
          />
          <input
            type="button"
            id={"duplicate-song-" + num}
            className="song-card-button"
            onClick={this.handleDuplicateClick}
            value="⎘"
          />
        </div>
      </div>
    );
  }
}
