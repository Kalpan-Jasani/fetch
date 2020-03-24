/* global chrome */
import React from 'react';
import { Button, TextField, FormControl, IconButton, FormGroup } from '@material-ui/core';
import firebase from "firebase";
import clsx from 'clsx';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import './ArticleForm.css';

class ArticleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            url: "",
            notes: "",
            personalBoards: [],
            selectedBoards: [],
            submitted: false
        }
        
        this.tabQueried = false;   // non state variable! denoting whether chrome tab is queried
    }

    componentDidMount = () => {

        if(!this.tabQueried) {
            // try and read from the current active tab, grab the url and title 
            // and use that for the url and name fields
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if(tabs.length == 0) {
                    return;     // no active tab on current window? weird
                }
        
                const t = tabs[0];
                this.setState({
                    name: t.title && t.title,
                    url: t.url && t.url
                });
            });

            this.tabQueried = true;      // mark as queried so that re mounting does
                                    // not result in another query to chrome
        }
        
        // gets the personal boards of the user
        // updates automatically when new p board is added
        // TODO: this thing gets set up everytime the component mounts 
        // (so every re-render makes new listener)
        firebase.firestore()
            .collection("personalBoards")
            .doc(firebase.auth().currentUser.uid)
            .collection("pboards")
            .onSnapshot(function (querySnapshot) {
                var personalBoards = [];
                querySnapshot.forEach(function (doc) {
                    let newPersonalBoard = {
                        boardName: doc.data().boardName,
                        isPrivate: doc.data().isPrivate,
                        boardID: doc.id,
                    }
                    personalBoards.push(newPersonalBoard);
                });
                console.log("Current Personal Boards: ", personalBoards.join(", "));

                this.setState({
                    personalBoards: personalBoards,
                });
            }.bind(this));

    }

    render() {
        const personalBoards = this.state.personalBoards;

        return (
                <form>
                    <TextField
                        label="Name"
                        value={this.state.name}
                        name="name"
                        type="text"
                        required
                        color="secondary"
                        onChange={(e) => (this.setState({ name: e.target.value }))}
                    />
                    <TextField
                        id="outlined-basic"
                        label="Url"
                        placeholder="(http:// or https://)"
                        value={this.state.url}
                        name="url"
                        type="text"
                        required
                        color="secondary"
                        onChange={(e) => (this.setState({ url: e.target.value }))}
                    />

                    <TextField
                        id="outlined-basic"
                        label="Notes"
                        value={this.state.notes}
                        name="notes"
                        type="text"
                        color="secondary"
                        multiline
                        rows="3"
                        onChange={(e) => (this.setState({ notes: e.target.value }))}
                    />

                    <FormControl>
                        <InputLabel id="dropdown">Boards</InputLabel>
                        <Select
                            labelId="dropdown"
                            id="multiple-boards"
                            multiple
                            value={this.state.selectedBoards}
                            onChange={(e) => this.setState({ selectedBoards: e.target.value })
                            }
                        >
                            {personalBoards.map(board => (
                                <MenuItem key={board.boardID} value={board.boardID}>
                                    {board.boardName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <div>
                        <Button onClick={this.handleAdd} id="confirm" disabled={this.state.submitted}>
                            {!this.state.submitted ? "Ok" : "Added!"}
                        </Button>
                    </div>
                </form>
        );
    }

    handleAdd = (e) => {
        e.preventDefault(); // prevent submission of form 
                            // (update is not by HTTP POST but by Firebase call)
        const selectedBoards = [...this.state.selectedBoards];
        const userid = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        const articlePromise = db.collection(`/localArticles/users/${userid}`).add({
            name: this.state.name,
            url: this.state.url,
            notes: this.state.notes,
            read: false,
            starred: false,
            time: new Date(),
            user_reports: []
        });

        articlePromise.then((articleRef) => {
            const userBoards = db.collection(`/personalBoards/${userid}/pboards`);
            const boardPromises = selectedBoards.map((boardId) => {
                userBoards.doc(boardId).update({
                    articles: firebase.firestore.FieldValue.arrayUnion(articleRef)
                })
            });
            Promise.all(boardPromises).then(() => {
                this.setState({submitted: true});
            }).catch(err => console.log(err));

        }).catch((err) => console.log(err));
        
    }
}

export default ArticleForm;
