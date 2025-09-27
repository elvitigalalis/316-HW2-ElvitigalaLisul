import {jsTPS_Transaction} from 'jstps';
/**
 * RemoveSong_Transaction
 *
 * This class represents a transaction that removes a song
 * from the playlist. It will be managed by the transaction stack.
 *
 * @author elvitigalalis
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initSongIndex, initRemovedSong) {
    super();
    this.app = initApp;
    this.songIndex = initSongIndex;
    this.removedSong = initRemovedSong;
  }

  executeDo() {
    this.app.updateSongArray(this.songIndex, this.removedSong, true);
  }

  executeUndo() {
    this.app.updateSongArray(this.songIndex, this.removedSong, false);
  }
}