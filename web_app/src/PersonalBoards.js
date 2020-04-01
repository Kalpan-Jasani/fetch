import React from 'react';
import { Button, TextField, FormControlLabel, IconButton, Grid } from '@material-ui/core';
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
import {Link} from 'react-router-dom';

import logo from './Assets/fetch.png'


class PersonalBoards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boardName: '',
            isPrivate: false,
            isDialogOpen: false,
            isAddOpen: false,
            personalBoards: [],
            isDeleteDialogOpen: false,
            selectedBoardDelete: "",
        }
    }

    componentDidMount() {
        // gets the personal boards of the user
        // updates automatically when new p board is added
        firebase.firestore()
        .collection("personalBoards")
        .doc(firebase.auth().currentUser.uid)
        .collection("pboards")
        .orderBy("timestamp")
        .onSnapshot(function(querySnapshot) {
            var personalBoards = [];
            querySnapshot.forEach(function(doc) {
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


    handleChangeMultiple = (event) => {
    const options = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
  }
    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        // get the form data out of state
        const { boardName, isPrivate } = this.state;

        // clear the form
        this.setState({
            boardName: '',
            isPrivate: false,
        });

        console.log("Board Name: " + boardName)
        console.log("Private: " + isPrivate)

        // make the new personal board here
        await firebase.firestore()
        .collection("personalBoards")
        .doc(firebase.auth().currentUser.uid)
        .collection("pboards")
        .add({
            boardName: boardName,
            isPrivate: isPrivate,
            articles: [],   // TODO: allow articles to be added initially ?
            followers: [],
            queue: [],
            timestamp: Date.now(),
        }).then(function(docRef) {
            console.log("success! docID", docRef.id);
        })
        .catch(function(error) {
            console.error("Error when writing doc to database ", error);
        });

        // will close the dialog after submission
        this.setState({
            isDialogOpen: false,
        });
    }

    handleDialogOpen = () => {

        this.setState({
            isDialogOpen: true,
        });
    }

    handleAddOpen = () => {

        this.setState({
            isAddOpen: true,
        });
    }

    handleDialogClose = () => {
        // closes the dialog and resets the form
        this.setState({
            isDialogOpen: false,
            boardName: '',
            isPrivate: false
        });
    }

    handleAddClose = () => {

        this.setState({
            isAddOpen: false
        });
    }

    handleDeleteDialogOpen = (doc) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isDeleteDialogOpen: true,
            selectedBoardDelete: doc,
        });
    }

    handleDeleteDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isDeleteDialogOpen: false,
            selectedBoardDelete: "",
        });
    }

    handleDeleteBoard = async (doc) => {
        console.log('Delete', doc);

        await firebase.firestore()
        .collection("personalBoards")
        .doc(firebase.auth().currentUser.uid) // hardcoded userid
        .collection("pboards")
        .doc(doc)
        .delete()
        .then(function() {
            console.log("Personal board successfully deleted!");
        })
        .catch(function(error) {
            console.error("Error deleting personal board: ", error);
        });

        // will close the dialog after submission
        this.setState({
            isDeleteDialogOpen: false,
            selectedBoardDelete: "",
        });

    }

    render() {
        const personalBoards = this.state.personalBoards;

        return <div>
            <h1>
                Personal Boards
            </h1>
            <Button
                variant="contained"
                color="primary"
                onClick={this.handleDialogOpen}
            >
                New Personal Board
            </Button>
            <Dialog
                open={this.state.isDialogOpen}
                onClose={this.handleDialogClose}
            >
                <DialogTitle>
                    Create a new Personal Board!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the name of your new Personal Board.
                        If you make your personal board Private, no one but you will be able to see it!
                    </DialogContentText>

                    <form
                        onSubmit={this.handleSubmit}
                        style={{ paddingLeft: 25, flexDirection: 'column', display: 'flex', paddingRight: 25, justifyContent: 'space-around', height: 250 }}
                    >
                        <TextField
                            id="outlined-basic"
                            label="Board Name"
                            placeholder="Tech, Politics, etc..."
                            value={this.state.boardName}
                            name="boardName"
                            onChange={this.handleInputChange}
                            type="text"
                            required
                            color="secondary"
                        />
                        <FormControlLabel
                            label="Private"
                            control={
                                <Checkbox
                                    name="isPrivate"
                                    checked={this.state.isPrivate}
                                    onChange={this.handleInputChange}
                                    color="secondary"
                                />}
                        />
                        <Button variant="contained" color="secondary" type="submit">
                            Create
                        </Button>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={this.state.isDeleteDialogOpen}
                onClose={this.handleDeleteDialogClose}
            >
                <DialogTitle>
                    Are you sure you want to delete this Personal Board?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={this.handleDeleteDialogClose}>No</Button>
                    <Button onClick={() => this.handleDeleteBoard(this.state.selectedBoardDelete)} color="secondary">Yes</Button>
                </DialogActions>

            </Dialog>

            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
            >
            {personalBoards.map(board => (
                <Grid 
                key={board.boardID} 
                item
                >
                  <Card style={{minWidth: 250, minHeight: 100, margin: 7}} >
                      <CardHeader
                      title={board.boardName}
                      subheader={board.isPrivate ? <Lock/> : <LockOpen/> }
                      action={
                        <IconButton onClick={() => this.handleDeleteDialogOpen(board.boardID)}>
                            <Delete />
                        </IconButton>
                        }
                      >
                      </CardHeader>
                      <CardMedia style={{height: 0, paddingTop: '50%'}}
                        image={logo}
                        title="FETCH"
                      />
                    <CardActions>
                        <IconButton>
                            <PlayArrow/>
                        </IconButton>
                        <Button>
                            <Link to={"/boards/"+board.boardID}>
                                View
                            </Link>
                        </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
        </div>
    }

}

export default PersonalBoards;
