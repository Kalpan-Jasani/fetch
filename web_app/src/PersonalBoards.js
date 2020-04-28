import React from 'react';
import { Button, TextField, FormControlLabel, IconButton, Grid } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Menu, ListItemIcon } from '@material-ui/core';
import { Card, CardHeader, CardActions, CardMedia } from '@material-ui/core'
import { Lock, LockOpen, Delete, PlayArrow, MoreVert, Image, RemoveCircle } from '@material-ui/icons';
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
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import PlayQueue from './PlayQueue'
import logo from './Assets/fetch.png';

import './personalBoards.css';

class PersonalBoards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boardName: '',
            isPrivate: false,
            boardImageURL: "",
            isDialogOpen: false,
            isAddOpen: false,
            personalBoards: [],
            isDeleteDialogOpen: false,
            selectedBoardDelete: " ",
            isPrivateDialogOpen: false,
            selectedBoardPrivate: " ",
            isSelectedBoardPrivate: false,
            selectedBoardName: "",

            anchorEl: null,
            selectedBoardID: " ",
            isImageChangeDialogOpen: false,
            isDeleteImageDialogOpen: false,
            open: false,
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
                    imageURL: doc.data().imageURL || "",
                    boardID: doc.id,
                    queue: doc.data().queue,
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
        const { boardName, isPrivate, boardImageURL } = this.state;

        // clear the form
        this.setState({
            boardName: '',
            isPrivate: false,
            boardImageURL: "",
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
            imageURL: boardImageURL,
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
            isPrivate: false,
            boardImageURL: "",
        });
    }

    handleAddClose = () => {

        this.setState({
            isAddOpen: false
        });
    }

    handleDeleteDialogOpen = (doc, docName) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isDeleteDialogOpen: true,
            selectedBoardDelete: doc,
            selectedBoardName: docName
        });
        this.handleMenuClose(); // will close the menu when delete selected
    }

    handleDeleteDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isDeleteDialogOpen: false,
            selectedBoardDelete: " ",
        });
    }

    handleDeleteBoard = async (doc) => {
        console.log('Delete', doc);

        await firebase.firestore()
        .collection("personalBoards")
        .doc(firebase.auth().currentUser.uid)
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
            selectedBoardDelete: " ",
        });

    }

    handlePrivateDialogOpen = (doc, docName, isPrivate) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isPrivateDialogOpen: true,
            selectedBoardPrivate: doc,
            isSelectedBoardPrivate: isPrivate,
            selectedBoardName: docName,
        });
    }

    handlePrivateDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isPrivateDialogOpen: false,
            selectedBoardPrivate: " ",
        });
    }

    handleChangePrivate = async (doc, isPrivate) => {
        await firebase.firestore()
        .collection('personalBoards')
        .doc(firebase.auth().currentUser.uid)
        .collection("pboards")
        .doc(doc)
        .update({
            isPrivate: !isPrivate,
        });
        this.handlePrivateDialogClose();

    }

    handleMenuOpen = (event, doc, docName) => {
        this.setState({
            anchorEl: event.currentTarget,
            selectedBoardID: doc,
            selectedBoardName: docName,
        });
    }
    
    handleMenuClose = () => {
        this.setState({
            anchorEl: null,
        });
    }

    handleImageChangeDialogOpen = () => {
        this.setState({
            isImageChangeDialogOpen: true,
        });
        this.handleMenuClose(); // will close the menu when Change Image selected
    }

    handleImageChangeDialogClose = () => {
        this.setState({
            isImageChangeDialogOpen: false,
            boardImageURL: "",
        });
    }

    handleImageChange = async (event, doc) => {
        event.preventDefault();
        // get the form data out of state
        const {boardImageURL}  = this.state;

        // clear the form
        this.setState({
            boardImageURL: "",
        });

        await firebase.firestore()
        .collection('personalBoards')
        .doc(firebase.auth().currentUser.uid)
        .collection("pboards")
        .doc(doc)
        .update({
            imageURL: boardImageURL
        });
        this.handleImageChangeDialogClose();
    }

    handleDeleteImageDialogOpen = () => {
        this.setState({
            isDeleteImageDialogOpen: true,
        });
        this.handleMenuClose(); // will close the menu when Remove Image selected
    }

    handleDeleteImageDialogClose = () => {
        this.setState({
            isDeleteImageDialogOpen: false,
        });
    }

    handleDeleteImage = async (doc) => {
        await firebase.firestore()
        .collection('personalBoards')
        .doc(firebase.auth().currentUser.uid)
        .collection("pboards")
        .doc(doc)
        .update({
            imageURL: ""
        });
        this.handleDeleteImageDialogClose();
    }

    play = () => {
        this.setState({
            open: "true",
        });
    }
    //const classes = useStyles();

    stop = () => {
        this.setState({
            open: "false",
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
                id="add-personal-board"
            >
                <AddCircleOutlinedIcon/>
                New board
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
                        <TextField
                            id="outlined-basic"
                            label="Image URL"
                            placeholder="Example: https://reactjs.org/logo-og.png"
                            value={this.state.boardImageURL}
                            name="boardImageURL"
                            onChange={this.handleInputChange}
                            type="text"
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
                    Are you sure you want to DELETE the "{this.state.selectedBoardName}" Personal Board?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={this.handleDeleteDialogClose}>No</Button>
                    <Button onClick={() => this.handleDeleteBoard(this.state.selectedBoardDelete)} color="secondary">Yes</Button>
                </DialogActions>

            </Dialog>
            <Dialog
                open={this.state.isPrivateDialogOpen}
                onClose={this.handlePrivateDialogClose}
            >
                <DialogTitle>
                    {this.state.isSelectedBoardPrivate ? 
                    "Are you sure you want to make the \"" + this.state.selectedBoardName + "\" Personal Board NOT private?" 
                    : 
                    "Are you sure you want to make the \"" + this.state.selectedBoardName + "\" Personal Board private?"
                    }
                </DialogTitle>
                <DialogActions>
                    <Button onClick={this.handlePrivateDialogClose}>No</Button>
                    <Button onClick={() => this.handleChangePrivate(this.state.selectedBoardPrivate, this.state.isSelectedBoardPrivate)} color="secondary">Yes</Button>
                </DialogActions>

            </Dialog>
            <Menu
              id="customized-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
            >
                <MenuItem onClick={() => this.handleDeleteDialogOpen(this.state.selectedBoardID, this.state.selectedBoardName)} >
                    <ListItemIcon>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText primary="Delete"/>
                </MenuItem>
                <MenuItem onClick={() => this.handleImageChangeDialogOpen()} >
                    <ListItemIcon>
                        <Image />
                    </ListItemIcon>
                    <ListItemText primary="Change Image"/>
                </MenuItem>
                <MenuItem onClick={() => this.handleDeleteImageDialogOpen()} >
                    <ListItemIcon>
                        <RemoveCircle />
                    </ListItemIcon>
                    <ListItemText primary="Remove Image"/>
                </MenuItem>
            </Menu>

            <Dialog
                open={this.state.isImageChangeDialogOpen}
                onClose={this.handleImageChangeDialogClose}
            >
                <DialogTitle>
                Change the Image of the "{this.state.selectedBoardName}" Personal Board.
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the image URL.
                    </DialogContentText>

                    <form
                        onSubmit={(e) => this.handleImageChange(e, this.state.selectedBoardID)}
                        style={{ paddingLeft: 25, flexDirection: 'column', display: 'flex', paddingRight: 25, justifyContent: 'space-around', height: 250 }}
                    >
                        <TextField
                            id="outlined-basic"
                            label="Image URL"
                            placeholder="Example: https://reactjs.org/logo-og.png"
                            value={this.state.boardImageURL}
                            name="boardImageURL"
                            onChange={this.handleInputChange}
                            type="text"
                            color="secondary"
                            required
                        />
                        <Button variant="contained" color="secondary" type="submit">
                            Save Change
                        </Button>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleImageChangeDialogClose} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>        
            
            <Dialog
                open={this.state.isDeleteImageDialogOpen}
                onClose={this.handleDeleteImageDialogClose}
            >
                <DialogTitle>
                    Are you sure you want to remove the image for the "{this.state.selectedBoardName}" Personal Board?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Removing the image will set the image to the FETCH logo.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDeleteImageDialogClose}>No</Button>
                    <Button onClick={() => this.handleDeleteImage(this.state.selectedBoardID)} color="secondary">Yes</Button>
                </DialogActions>
            </Dialog>

            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
              id="boards-grid"
            >
            {personalBoards.map(board => (
                <Grid 
                key={board.boardID} 
                item
                >
                  <Card style={{width: 250, height: 300, margin: '0.5rem'}} >
                      <CardHeader
                      title={board.boardName}
                      subheader={board.isPrivate ? 
                        <IconButton onClick={() => this.handlePrivateDialogOpen(board.boardID, board.boardName, true)}>
                            <Lock/>
                        </IconButton> 
                        : 
                        <IconButton onClick={() => this.handlePrivateDialogOpen(board.boardID, board.boardName, false)}>
                            <LockOpen/>
                        </IconButton> 
                      }
                      action={
                        <IconButton onClick={(e) => this.handleMenuOpen(e, board.boardID, board.boardName)}>
                            <MoreVert />
                        </IconButton>
                        }
                      >
                      </CardHeader>
                      <CardMedia style={{height: 0, paddingTop: '50%'}}
                        image={(board.imageURL === "") ?
                            logo
                            :
                            board.imageURL
                        }
                        title="FETCH"
                      />
                    <CardActions>
                        <IconButton onClick={this.play}>
                            <PlayArrow/>
                        </IconButton>
                        <Button>
                            <Link to={"/boards/"+board.boardID}>
                                View
                            </Link>
                        </Button>
                    </CardActions>
                  </Card>
                   {/* Playlist modal */}
                   { this.state.open ? (
                            <div>
                                <PlayQueue 
                                queue={board.queue}
                                stop={this.stop}
                                open={this.state.open}
                                />
                            </div>
                            ): null }
                </Grid>
              ))}
            </Grid>
        </div>
    }

}

export default PersonalBoards;
