import React from 'react';
import { Button, TextField, IconButton, Typography } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Card, CardHeader, CardActions, CardMedia, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from '@material-ui/core'
import { Lock, LockOpen, PlayArrow } from '@material-ui/icons';
import firebase from "firebase";
import SearchBar from 'material-ui-search-bar';
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
      searchedBoard: [],
      articleList: [],
      searchType: "title",
      selectedBoard: [],
      followedBoards: [],
      search: '', 
      isSearching: false,
      followed: false,
    }
    
    this.db = firebase.firestore();
    this.userid = firebase.auth().currentUser.uid;
    this.componentDidMount = this.componentDidMount.bind(this);
    //this.componentDidUnmount = this.componentDidUnmount.bind(this);
    

  }


  componentDidMount() {
      // gets the personal boards of the user
      // updates automatically when new p board is added


      firebase.firestore()
      .collection("communityBoards")
      .onSnapshot(function(querySnapshot) {
          var communityBoards = [];
          var communityArticles = [];
          querySnapshot.forEach(function(doc) {
              let newCommunityBoard = {
                  name: doc.data().name,
                  isPrivate: false,
                  boardID: doc.id,
              }

              doc.data().articles.forEach((ref) => communityArticles.push(ref.get()));

              communityBoards.push(newCommunityBoard);
          });
          this.getArticles(communityArticles);

          this.setState({
              communityBoards: communityBoards,
          });
      }.bind(this));
      
      
      
      /*firebase.firestore()
      .doc(`users/${this.userid}`)
      .onSnapshot(async (userSnapshot) => {
          var followedBoards = [];
          const cb = userSnapshot.data().cboardFollowing || [];
          cb.forEach(async (boardID) => {
            if(!followedBoards.includes(boardID)){
                const board =  (await this.db.doc(`communityBoards/${boardID}`).get()).data();
                let newFollowedBoard = {
                    name: board.name,
                    isPrivate: false,
                    boardID: boardID,
                }
                followedBoards.push(newFollowedBoard);
            }    
        });
        this.setState({
              followedBoards: followedBoards,
            });
        }, err => alert(err));
        */

        var user = firebase.auth().currentUser;
         
        try{
            firebase.firestore().collection('users').doc(user.uid)
            .onSnapshot((userDoc) => {
                
                const userInfo = userDoc.data();
                const fb = userInfo.cboardFollowing || [];
                const followedBoards = Array.from(new Set(fb));
                //console.log("articleids ", articleIds);

                const artP = followedBoards.map(artID =>
                    firebase.firestore().doc(`communityBoards/${artID}`)
                    .get().then((articleDoc) => {
                    
                        console.log(articleDoc.data().name);

                        return {
                        name: articleDoc.data().name,
                        boardID: artID,
                        
                    }})
                        
                    
                );
                
                Promise.all(artP).then((articles) => {
                    const s = []
                    articles.forEach((article) => {
                        s.push(article)
                    })
                    const uniqueBoards = Array.from(new Set(s));
                    this.setState({
                        followedBoards: uniqueBoards,
                    });    
                })
            });
    }
    catch(err){
        console.log(err);
    }
      
  }
  
 
    


  getArticles(communityArticles) {
    Promise.all(communityArticles).then((arr) => {
        console.log(arr);
        this.setState({
            articleList: arr,
        })
    });
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

      // make the new personal board here
      await firebase.firestore()
      .collection("communityBoards")
      .add({
          name: name,
          isPrivate: isPrivate,
          articles: [],   // TODO: allow articles to be added initially ?
      }).then(function(docRef) {
          console.log("success! docID", docRef.id);
          this.state.communityBoards.push({
              name: name,
              isPrivate: isPrivate,
              articles: [],
          });
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

  GetBoardByTitle(e) {
    if (this.state.communityBoards !== undefined) {
        const searchedboard = []
        
        this.state.communityBoards.filter((board) => {
            if (board.name.toUpperCase().includes(e.toUpperCase())) {
                searchedboard.push(board);
            }
        })
        this.setState({
            searchedBoard : searchedboard
        })
  }
}

GetBoardByKeyword(e) {
    if (this.state.articleList !== undefined && this.state.communityBoards !== undefined) {
        const searchedBoardIDs = [];
        const searchedboard = [];
        
        this.state.articleList.filter((article) => {
            var data = article.data();
            console.log(data);
            if (data.name.toUpperCase().includes(e.toUpperCase()) || data.url.toUpperCase().includes(e.toUpperCase())) {
                data.communities.forEach((ref) => {
                    if (!searchedBoardIDs.includes(ref)) {
                        searchedBoardIDs.push(ref);
                    }
                });
            }
        });
        
        searchedBoardIDs.forEach((id) => {
            var board = this.state.communityBoards.find((element) => element.boardID === id);
            if (board !== undefined) {
                searchedboard.push(board);
            }
        });

        this.setState({
            searchedBoard : searchedboard
        });
  }
}

 followBoard = async (board) => {
    
        var bid = board.boardID;
        const currID = firebase.auth().currentUser.uid;
        const userPath = firebase.firestore().collection("users").doc(currID);
        

         await firebase.firestore().runTransaction((followTransaction) => {
            return followTransaction.get(userPath).then((doc) => {
                
                var fields = doc.data();
                var cboardFollowing = fields.cboardFollowing ?? [];
                cboardFollowing.push(bid);                
                followTransaction.update(userPath, {cboardFollowing: cboardFollowing});
                
            })
            
        });    

        
}


unfollowBoard = async (board) => {
    
    var bid = board.boardID;
    const currID = firebase.auth().currentUser.uid;
    const userPath = firebase.firestore().collection("users").doc(currID);
    

     await firebase.firestore().runTransaction((followTransaction) => {
        return followTransaction.get(userPath).then((doc) => {
            
            var fields = doc.data();
            var cb = fields.cboardFollowing ?? [];
            var cboardFollowing = Array.from(new Set(cb));
            var index = cboardFollowing.indexOf(bid);
                    if (index > -1) {
                        cboardFollowing.splice(index, 1);
                    } else {
                        console.log("user is not a follower!");
                    }              
            followTransaction.update(userPath, {cboardFollowing: cboardFollowing});
            
        })
        
    });    

    
}


    

displayFollowedBoards = () => {
    console.log(this.state.followedBoards);
    
    return (
        
        <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
        
        {this.state.followedBoards.map(board => (
               <div key={board.boardID} id="followed-community-boards-cards">
              <Card style={{width: 350, height: 300, margin: '0.5rem'}} >
                  <CardHeader
                  title={board.name}
                  >
                  </CardHeader>
                  <CardMedia style={{height: 0, paddingTop: '50%'}}
                    image={logo}
                    title="FETCH"
                  />
                <CardActions style={{position: 'relative', bottom: '0px',}}>
                    <Button>
                        <Link to={"/community-boards/"+board.boardID}>
                            View
                        </Link>
                    </Button>
                    <Button color="primary" onClick={() => this.unfollowBoard(board)}>
                        Unfollow
                    </Button>
                </CardActions>
              </Card>
            </div>
          ))}
        </div>
    );


}
displayBoards() {
    if(this.state.isSearching){
        if(this.state.searchedBoard !== undefined){
            return this.state.searchedBoard.map(board => (
                       <div key={board.boardID} id="community-boards-cards" >
                      <Card style={{width: 350, height: 300, margin: '0.5rem'}} >
                          <CardHeader
                          title={board.name}
                          >
                          </CardHeader>
                          <CardMedia style={{height: 0, paddingTop: '50%'}}
                            image={logo}
                            title="FETCH"
                          />
                        <CardActions>
                            <Button>
                                <Link to={"/community-boards/"+board.boardID}>
                                    View
                                </Link>
                            </Button>
                            <Button color="primary" onClick={() => this.followBoard(board)}>
                                Follow
                            </Button> }
                            
                        </CardActions>
                      </Card>
                    </div>
                  ))
        } else {
            return (
                <div>
                    <h1> Sorry , No community boards found </h1>
                </div>
            );
        }
    } else { 
        return this.state.communityBoards.map(board => (
               <div key={board.boardID} id="community-boards-cards" >
              <Card style={{width: 350, height: 300, margin: '0.5rem'}} >
                  <CardHeader
                  title={board.name}
                  >
                  </CardHeader>
                  <CardMedia style={{height: 0, paddingTop: '50%'}}
                    image={logo}
                    title="FETCH"
                  />
                <CardActions>
                    <Button>
                        <Link to={"/community-boards/"+board.boardID}>
                            View
                        </Link>
                    </Button>
                    <Button color="primary" onClick={() => this.followBoard(board)}>
                        Follow
                    </Button>
                </CardActions>
              </Card>
            </div>
          ))
    }
} 


  render() {
      const communityBoards = this.state.communityBoards;

      return <div>
        <div className="page-container">
          <Typography variant="h4" component="h1">
            Community Boards
          </Typography>
          <FormControl component="fieldset">
              <FormLabel component="legend">Search Type</FormLabel>
              <RadioGroup row aria-label="position" name="position" defaultValue="title">
                  <FormControlLabel
                    value="title"
                    control={<Radio color="primary" onClick={() => this.setState({searchType: "title"})}/>}
                    label="Title"
                    labelPlacement="left"
                  />
                  <FormControlLabel
                    value="keyword"
                    control={<Radio color="primary" onClick={() => this.setState({searchType: "keyword"})} />}
                    label="Keyword"
                    labelPlacement="left"
                  />
              </RadioGroup>
          </FormControl>
          <SearchBar
                value={this.state.search}
                onChange={(value) => {
                    if (value === "") {
                        this.setState({
                            search: "",
                            isSearching: false,
                            searchedBoard: [],
                        });
                    } else {
                        if (this.state.searchType === "title") {
                            this.GetBoardByTitle(value);
                        } else {
                            this.GetBoardByKeyword(value);
                        }

                        this.setState({
                            search: value,
                            isSearching: true,
                        });
                    }
                }}
                onCancelSearch={() => {
                    if (this.state.searchType === "title") {
                        this.GetBoardByTitle("");
                    } else {
                        this.GetBoardByKeyword("");
                    }

                    this.setState({
                        search: "",
                        isSearching: false,
                        searchedBoard: [],
                    });
                }}
                style={{
                  margin: '40px',
                  maxWidth: 800,
                }}
            />
          <Button
              variant="contained"
              color="primary"
              onClick={this.handleDialogOpen}
              id="add-community"
              style={{
                  margin: '20px'
              }}
          >
              <AddCircleOutlinedIcon/>
              Create a community
          </Button>
          <h2> Boards Following </h2>
          <div>
              {this.displayFollowedBoards()}
          </div>
          <h2> All Community Boards </h2>
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
          </div>

          <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
              {this.displayBoards()}
          </div>
      </div>
  }

}



export default CommunityBoards;
