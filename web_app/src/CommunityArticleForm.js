import React from 'react';
import { Button, TextField, FormControlLabel, IconButton } from '@material-ui/core';
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
import logo from './Assets/fetch.png'


class CommunityArticleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            url: "",
            notes: "",
            communityBoards: [],
            selectedBoards: [],
        }
    }

    componentDidMount() {
        // gets the personal boards of the user
        // updates automatically when new p board is added
        firebase.firestore()
            .collection("communityBoards")
            .onSnapshot(function (querySnapshot) {
                var communityBoards = [];
                querySnapshot.forEach(function (doc) {
                    let newCommunityBoard = {
                        name: doc.data().name,
                        isPrivate: doc.data().isPrivate,
                        boardID: doc.id,
                    }
                    communityBoards.push(newCommunityBoard);
                });
                console.log("Current Personal Boards: ", communityBoards.join(", "));

                this.setState({
                    communityBoards: communityBoards,
                });
            }.bind(this));

    }

    handleInputChange = (event) => this.setState({ value: event.target.value });

    render() {
        const communityBoards = this.state.communityBoards;

        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.onClose}

            >
                <TextField
                    id="outlined-basic"
                    label="Enter Title"
                    placeholder="Enter name of the article"
                    value={this.state.name}
                    name="name"
                    type="text"
                    required
                    color="secondary"
                    onChange={(e) => (this.setState({ name: e.target.value }))}
                />
                <TextField
                    id="outlined-basic"
                    label="URL"
                    placeholder="Enter web address (http:// or https://)"
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
                    placeholder="Enter any comments"
                    value={this.state.notes}
                    name="notes"
                    type="text"
                    color="secondary"
                    onChange={(e) => (this.setState({ notes: e.target.value }))}
                />

                <FormControl>
                    <InputLabel id="dropdown">Select Community Board</InputLabel>
                    <Select
                        labelId="dropdown"
                        id="multiple-boards"
                        multiple
                        value={this.state.selectedBoards}
                        onChange={(e) => this.setState({ selectedBoards: e.target.value })
                        }
                    >
                        {communityBoards.map(board => (
                            <MenuItem key={board.boardID} value={board.boardID}>
                                {board.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <DialogActions>
                    <Button onClick={this.props.onClose}>Cancel</Button>
                    <Button color="primary" onClick={this.handleAdd}>Add</Button>
                    {this.props.board &&
                        <Button>Add to queue</Button>
                    }
                </DialogActions>
            </Dialog>
        );
    }

    handleAdd = () => {
        const selectedBoards = [...this.state.selectedBoards];
        const userid = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        const user_ref = db.doc(`/users/${userid}`);
        const articlePromise = db.collection(`/communityArticles`).add({
            name: this.state.name,
            url: this.state.url,
            notes: this.state.notes,
            communities: [],
            user: user_ref,
            time: new Date(),
            comments: [],
            users_eyebrows: [],
            user_reports: []
        });

        articlePromise.then((articleRef) => {
            const userBoards = db.collection(`/communityBoards`);
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
            communityBoards: [],
            selectedBoards: [],
        });
        this.props.onClose();
    }
}

export default CommunityArticleForm;
