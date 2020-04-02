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
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';


import logo from './Assets/fetch.png';
import './communityBoards.css';

class CommunityBoards extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      name: '',
      isPrivate: false,
      isDialogOpen: false,
      isAddOpen: false,
      communityBoards: [],
    }
  }


  componentDidMount() {
      // gets the personal boards of the user
      // updates automatically when new p board is added
      firebase.firestore()
      .collection("communityBoards")
      .onSnapshot(function(querySnapshot) {
          var communityBoards = [];
          querySnapshot.forEach(function(doc) {
              let newCommunityBoard = {
                  name: doc.data().name,
                  isPrivate: false,
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
      const { name, isPrivate } = this.state;

      // clear the form
      this.setState({
          name: '',
          isPrivate: false,
      });

      console.log("Board Name: " + name)
      console.log("Private: " + isPrivate)

      // make the new personal board here
      await firebase.firestore()
      .collection("communityBoards")
      .add({
          name: name,
          isPrivate: isPrivate,
          articles: [],   // TODO: allow articles to be added initially ?
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
          name: '',
          isPrivate: false
      });
  }

  handleAddClose = () => {

      this.setState({
          isAddOpen: false
      });
  }


  render() {
      const communityBoards = this.state.communityBoards;

      return <div>
          <h1>
              Community Boards
          </h1>
          <Button
              variant="contained"
              color="primary"
              onClick={this.handleDialogOpen}
              id="add-community"
          >
              <AddCircleOutlinedIcon/>
              Create a community
          </Button>
          <Dialog
              open={this.state.isDialogOpen}
              onClose={this.handleDialogClose}
          >
              <DialogTitle>
                  Create a new Community Board!
              </DialogTitle>
              <DialogContent>
                  <DialogContentText>
                      Please enter the name of the new Community Board.
                      Community Boards are public and visible to all users.
                  </DialogContentText>

                  <form
                      onSubmit={this.handleSubmit}
                      style={{ paddingLeft: 25, flexDirection: 'column', display: 'flex', paddingRight: 25, justifyContent: 'space-around', height: 250 }}
                  >
                      <TextField
                          id="outlined-basic"
                          label="Board Name"
                          placeholder="Tech, Politics, etc..."
                          value={this.state.name}
                          name="name"
                          onChange={this.handleInputChange}
                          type="text"
                          required
                          color="secondary"
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

          <Grid id="boards-grid"
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            {communityBoards.map(board => (
                <Grid 
                  key={board.boardID} 
                  item>
                    <Card style={{width: 250, height: 300, margin: '0.5rem'}} >
                        <CardHeader
                        title={board.name}
                        subheader={board.isPrivate ? <Lock/> : <LockOpen/> }

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
                                <Link to={"/community-boards/"+board.boardID}>
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



export default CommunityBoards;
