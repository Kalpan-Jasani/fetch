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


class ArticleForm extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          boardName: '',
          isPrivate: false,
          personalBoards: [],
      }
  }

  componentDidMount() {
      // gets the personal boards of the user
      // updates automatically when new p board is added
      firebase.firestore()
      .collection("personalBoards")
      .doc("ZoiGTzwfFugLUTUP9s6JbcpHH3C2") // hardcoded user
      .collection("pboards")
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

  
  render() {
      const personalBoards = this.state.personalBoards;

      return <div>

          <Dialog
              open={this.props.open}
              onClose={this.props.onClose}
              onCancel={this.props.onClose}
          >
              <DialogTitle>
                  Enter the details of the article
              </DialogTitle>
              <TextField
                  id="outlined-basic"
                  label="Enter Title"
                  placeholder="Enter name of the article"
                  value={this.state.boardName}
                  onChange={this.handleInputChange}
                  name="board Name"
                  type="text"
                  required
                  color="secondary"
              />
              <TextField
                id="outlined-basic"
                label="Enter URL"
                placeholder="Enter web address"
                value={this.state.boardName}
                onChange={this.handleInputChange}
                name="board Name"
                type="text"
                required
                color="secondary"
              />

              <TextField
                  id="outlined-basic"
                  label="Enter Description"
                  placeholder="Enter any comments"
                  value={this.state.boardName}
                  onChange={this.handleInputChange}
                  name="board Name"
                  type="text"
                  color="secondary"
              />

              <FormControl>
              <InputLabel id="dropdown">Select Board</InputLabel>
              <Select
                  labelId="dropdown"
                  id="multiple-boards"
                  multiple
                  value={personalBoards}
                  onChange={this.handleChangeMultiple}
              >


              {personalBoards.map(board => (
                  <MenuItem key={board.boardID} value={board.boardName}>
                      {board.boardName}
                  </MenuItem>
              ))}
              </Select>
              </FormControl>

              <DialogActions>
                  <Button onClick={this.props.onClose}>Cancel</Button>
                  <Button color="primary">Add</Button>
              </DialogActions>
          </Dialog>
      </div>
  }
}

export default ArticleForm;
