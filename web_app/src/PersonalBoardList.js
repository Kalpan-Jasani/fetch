import React from 'react';
import firebase from "firebase/app";
import { Card, CardContent, Typography, Avatar } from "@material-ui/core";
import { withRouter, Link } from 'react-router-dom';
import { Button, TextField, FormControlLabel, IconButton, Grid } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { CardHeader, CardActions, CardMedia } from '@material-ui/core';
import { Lock, LockOpen, Delete, PlayArrow } from '@material-ui/icons';

import logo from './Assets/fetch.png'

class PersonalBoardList extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {"personalBoards": [], "uid": this.props.match.params.id}
        this.getBoardCards = this.getBoardCards.bind(this);
    }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        if (user !== undefined) {
            firebase.firestore()
            .collection("personalBoards")
            .doc(this.state.uid)
            .collection("pboards")
            .where("isPrivate", "==", false)
            .onSnapshot((querySnapshot) => {
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
            }).bind(this);
        }
    }

    getBoardCards() {
        if (this.state.personalBoards.length === 0) {
            return <Card style={{ minWidth: 550, minHeight: 400, marginBottom: 25, marginTop: 50 }}>
            <CardContent>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', height: '100%', width: '100%' }}>
                   <h2>No Boards</h2>
                </div>
            </CardContent>
        </Card>
        } else {
            return <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
          {this.state.personalBoards.map(board => (
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
                          <Link to={`/boards/${this.state.uid}/${board.boardID}`}>
                              View
                          </Link>
                      </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            </Grid>
        }
    }


    render() {
        console.log(this.props);
        return (
         <div>
            <h1>Personal Boards</h1>
            <body>
            {this.getBoardCards()}
            </body>
         </div>   
        )
    }
}

export default withRouter(PersonalBoardList);