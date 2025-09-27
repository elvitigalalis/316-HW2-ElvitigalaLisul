import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.jsx';
import EditSongModal from './components/EditSongModal.jsx';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            // edit-song modal state
            songToEdit: null,
            songIndexToEdit: null,
            isEditSongModalVisible: false
        }
    }

    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }

    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }

    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }

    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }

    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }

    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }

    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }

    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.processTransaction(transaction);
    }

    // open edit modal
    handleEditSongCallback = (song, index) => {
        this.setState({
            songToEdit: song,
            songIndexToEdit: index,
            isEditSongModalVisible: true
        });
    };

    // cancel edit
    hideEditSongModal = () => {
        this.setState({
            songToEdit: null,
            isEditSongModalVisible: false,
            songIndexToEdit: null
        });
    }

    // confirm edit
    handleConfirmEditSong = (newSongData) => {
        const idx = this.state.songIndexToEdit;
        const list = this.state.currentList;
        if (list && list.songs && idx !== null) {
            const oldSongData = { ...list.songs[idx] };
            let tx = new EditSong_Transaction(this, idx, oldSongData, newSongData);
            this.tps.processTransaction(tx);
        }
        this.hideEditSongModal();
    };

    // update one song object at index
    updateSongData = (index, songData) => {
        if (this.state.currentList && this.state.currentList.songs) {
            let list = this.state.currentList;
            const songs = [...list.songs];
            songs[index] = { ...songs[index], ...songData };
            this.setStateWithUpdatedList({ ...list, songs });
        }
    }

    // splice helper for remove/undo-remove
    updateSongArray = (index, song, isDeletion) => {
        if (this.state.currentList && this.state.currentList.songs) {
            let list = this.state.currentList;
            const songs = [...list.songs];
            if (isDeletion) songs.splice(index, 1);
            else songs.splice(index, 0, song);
            this.setStateWithUpdatedList({ ...list, songs });
        }
    }

    // remove song as a transaction
    removeSong = (index) => {
        if (this.state.currentList && this.state.currentList.songs[index]) {
            const removed = { ...this.state.currentList.songs[index] };
            this.addRemoveSongTransaction(index, removed);
        }
    }

    addRemoveSongTransaction = (index, removedSong) => {
        let tx = new RemoveSong_Transaction(this, index, removedSong);
        this.tps.processTransaction(tx);
    }

    // duplicate song
    duplicateSong = (index) => {
        let list = this.state.currentList;
        if (list && list.songs) {
            let original = list.songs[index];
            let copy = { ...original };
            let newIndex = index + 1;
            this.addAddSongTransaction(copy, newIndex);
        }
    }

    // add song into array
    addSong = (newSong, newIndex) => {
        if (this.state.currentList) {
            let list = this.state.currentList;
            const songs = [...list.songs];
            songs.splice(newIndex, 0, newSong);
            this.setStateWithUpdatedList({ ...list, songs });
        }
    }

    addAddSongTransaction = (songToAdd, newIndex) => {
        let tx = new AddSong_Transaction(this, songToAdd, newIndex);
        this.tps.processTransaction(tx);
    }

    // duplicate playlist
    duplicateList = (key) => {
        let newKey = this.state.sessionData.nextKey;
        let original = this.db.queryGetList(key);
        let newName = original.name + " (Copy)";
        let newList = {
            key: newKey,
            name: newName,
            songs: original.songs.map(s => ({ ...s }))
        };
        let pair = { key: newKey, name: newName };
        let pairs = [...this.state.sessionData.keyNamePairs, pair];
        this.sortKeyNamePairsByName(pairs);
        this.setState(prev => ({
            currentList: newList,
            sessionData: {
                nextKey: prev.sessionData.nextKey + 1,
                counter: prev.sessionData.counter + 1,
                keyNamePairs: pairs
            }
        }), () => {
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    DEFAULT_SONG = {
        title: "Untitled",
        artist: "???",
        year: "2000",
        youTubeId: "dQw4w9WgXcQ"
    }

    handleAddSong = () => {
        if (this.state.currentList) {
            const s = { ...this.DEFAULT_SONG };
            const idx = this.state.currentList.songs.length;
            this.addAddSongTransaction(s, idx);
        }
    }

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToDo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }

    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }

    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }

    // keyboard: Ctrl/Cmd-Z, Ctrl/Cmd-Y and Enter to confirm delete
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keydown", this.handleGlobalKeyDown);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keydown", this.handleGlobalKeyDown);
    }
    handleKeyDown = (event) => {
        if (!this.state.currentList) return;
        const meta = event.ctrlKey || event.metaKey;
        if (meta) {
            if (event.key === 'z' || event.key === 'Z') {
                if (this.tps.hasTransactionToUndo()) {
                    this.undo();
                    event.preventDefault();
                }
            } else if (event.key === 'y' || event.key === 'Y') {
                if (this.tps.hasTransactionToDo()) {
                    this.redo();
                    event.preventDefault();
                }
            }
        }
    }
    handleGlobalKeyDown = (event) => {
        if (event.key === 'Enter' && this.state.listKeyPairMarkedForDeletion) {
            event.preventDefault();
            this.deleteMarkedList();
        }
    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToDo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    duplicateListCallback={this.duplicateList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.handleAddSong}
                />
                <SongCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    editSongCallback={this.handleEditSongCallback}
                    removeSongCallback={this.removeSong}
                    duplicateSongCallback={this.duplicateSong}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    song={this.state.songToEdit}
                    isVisible={this.state.isEditSongModalVisible}
                    editSongConfirmCallback={this.handleConfirmEditSong}
                    hideEditSongModalCallback={this.hideEditSongModal}
                />
            </div>
        );
    }
}

export default App;