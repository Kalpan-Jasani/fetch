import React from 'react';
import { Button, TextField, FormControlLabel, IconButton, FormGroup } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Card, CardHeader, CardActions, CardMedia } from '@material-ui/core'
import { Lock, LockOpen, Delete, PlayArrow } from '@material-ui/icons';
import firebase from "firebase";
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';


class ArticleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            personalBoards: [],
            selectedBoards: [],
        }
    }

    componentDidMount = () => {
        // gets the personal boards of the user
        // updates automatically when new p board is added
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

    /**
     * submit the selection for the new article
     * TODO: can change add button to be added (Added!) and disabled
     */
    submit = () => {

    }

    render() {
        const personalBoards = this.state.personalBoards;

        return (
                <form>

                    <InputLabel htmlFor="name">Name</InputLabel>
                    <Input
                        id="name"
                        placeholder="Enter name of the article"
                        value={this.state.name}
                        required
                        color="secondary"
                        onChange={(e) => (this.setState({ name: e.target.value }))}
                    />
                    <InputLabel htmlFor="url">URL</InputLabel>
                    <Input
                        id="url"
                        placeholder="Enter web address (http:// or https://)"
                        value={this.state.url}
                        required
                        color="secondary"
                        onChange={(e) => (this.setState({ url: e.target.value }))}
                    />
                    <InputLabel htmlFor="notes">Notes</InputLabel>
                    <Input
                        id="notes"
                        label="Notes"
                        placeholder="Enter any comments"
                        value={this.state.notes}
                        type="text"
                        onChange={(e) => (this.setState({ notes: e.target.value }))}
                    />
                    <InputLabel id="dropdown">Select Board</InputLabel>
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
                    <button id="confirm">Ok</button>
                </form>
        );
    }

    handleAdd = () => {
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
            selectedBoards.forEach((boardId) => {
                userBoards.doc(boardId).update({
                    articles: firebase.firestore.FieldValue.arrayUnion(articleRef)
                })
            });
        }).catch((err) => console.log(err));

        this.setState({
            name: "",
            url: "",
            notes: "",
            personalBoards: [],
            selectedBoards: [],
        });
        this.props.onClose();
    }
}

export default ArticleForm;
