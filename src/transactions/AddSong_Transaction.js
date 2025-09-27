import {jsTPS_Transaction} from 'jstps';
/**
 * AddSong_Transaction
 *
 * This class represents a transaction that adds a song
 * to the playlist. It will be managed by the transaction stack.
 *
 * @author elvitigalalis
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initSongToAdd, initIndex) {
    super();
    this.app = initApp;
    this.songToAdd = initSongToAdd;
    this.index = initIndex;
  }

  executeDo() {
    this.app.addSong(this.songToAdd, this.index);
  }

  executeUndo() {
    this.app.updateSongArray(this.index, this.songToAdd, true);
  }
}