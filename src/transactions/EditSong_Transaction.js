import {jsTPS_Transaction} from 'jstps';
/**
 * EditSong_Transaction
 *
 * This class represents a transaction that edits a song’s data
 * (title, artist, year, id). It will be managed by the transaction stack.
 *
 * @author elvitigalalis
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initSongIndex, initOldSongData, initNewSongData) {
    super();
    this.app = initApp;
    this.songIndex = initSongIndex;
    this.oldSongData = initOldSongData;
    this.newSongData = initNewSongData;
  }

  executeDo() {
    this.app.updateSongData(this.songIndex, this.newSongData);
  }

  executeUndo() {
    this.app.updateSongData(this.songIndex, this.oldSongData);
  }
}