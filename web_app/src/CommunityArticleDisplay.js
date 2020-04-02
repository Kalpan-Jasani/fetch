import React from 'react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import firebase from "firebase";
import { green } from '@material-ui/core/colors';
import { useParams } from 'react-router-dom';
import { func } from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class CommunityArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           Article: {},
           board: null,
           SaveDialogOpen: false,
           personalBoards: [],
           selectedBoards: [],
        }
    }

    componentDidMount() {
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

    handleDeleteDialogOpen = (doc) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isDeleteDialogOpen: true,
            selectedArticleDelete: doc,
        });
    }

    handleDeleteDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isDeleteDialogOpen: false,
            selectedArticleDelete: "",
        });
    }


    handleOpenNewTab = (event) => {
        window.open(this.props.url);
    }

    handleDeleteArticle = async () => {
      const props = this.props;
      const userid = firebase.auth().currentUser.uid;
     firebase.firestore().doc(`communityBoards/${this.props.boardId}`)
      .update({
          articles: firebase.firestore.FieldValue.arrayRemove(this.props.articleRef)
      })
      .then(function() {
          console.log("Article successfully deleted!");
          props.refreshBoard();
      })
      .catch(function(error) {
          console.error("Error deleting article: ", error);
      });

    this.handleDialogClose();
    }


    handleDialogOpen = () => {
        this.setState({
            isDialogOpen: true,
        })
    }

    handleDialogClose = () => {
        this.setState({
            isDialogOpen: false,
        });
    }

    handleSaveDialogOpen = () => {
        this.setState({
            SaveDialogOpen: true,
        })
    }

    handleSaveDialogClose = () => {
        this.setState({
            SaveDialogOpen: false,
        });
    }

    handleSave = () => {
        const selectedBoards = [...this.state.selectedBoards];
        const userid = firebase.auth().currentUser.uid;
        const currArticle = this.props.articleRef;

        console.log(this.props.articleRef);

        selectedBoards.forEach((boardId) => {
        firebase.firestore().collection("personalBoards")
        .doc(userid)
        .collection("pboards")
        .doc(boardId).update({
                        articles: firebase.firestore.FieldValue.arrayUnion(currArticle)
                    })
        });
            
        this.setState({
            selectedBoards: [],
            SaveDialogOpen: false,
        });
       
    }
    
    render() {

        return (
            <div>
            <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen}>
                    Preview
            </Button>
            <br/>
            <Dialog
            open={this.state.isDialogOpen}
            fullWidth={true}
            >
                <DialogTitle>
                    {this.props.ArticleName}
                </DialogTitle>

                <DialogContent>
                    <iframe src={this.props.url}  width="100%" height="500px" ></iframe>
                    <DialogActions style={{ paddingLeft: 20 }}>
                     <VisibilityIcon/>
                        <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                        Go to Website
                        </Button>

                        <Button variant="contained" color="primary" onClick={this.handleSaveDialogOpen}>
                        Save Article
                        </Button>
                        <Dialog 
                        open={this.state.SaveDialogOpen} 
                        onClose={this.handleSaveDialogClose} 
                        aria-labelledby="form-dialog-title" 
                        style={{
                            padding: '10px'
                        }}
                        >
                           
                            <DialogContent>
                            <FormControl style={{width: '200px'}}>
                                <InputLabel id="dropdown"> Select Board </InputLabel>
                                <Select
                                    labelId="dropdown"
                                    label = "Select Board"
                                    style={{
                                        margin: '10px'
                                    }}
                                    id="multiple-select"
                                    multiple
                                    value={this.state.selectedBoards}
                                    onChange={(e) => this.setState({ selectedBoards: e.target.value })
                                    }
                                >
                                    {this.state.personalBoards.map(board => (
                                        <MenuItem key={board.boardID} value={board.boardID}>
                                            {board.boardName}
                                        </MenuItem>
                                    ))}
                             </Select>
                             </FormControl>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={this.handleSave} color="secondary">
                                Save
                            </Button>
                            <Button onClick={this.handleSaveDialogClose} color="secondary">
                                Cancel
                            </Button>
                            </DialogActions>
                        </Dialog>
                    
                        <Button variant="contained" color="secondary" onClick={this.handleDialogClose} >
                        Close
                        </Button>
                        <Button onClick={() => this.handleDeleteArticle(this.state.selectedArticleDelete)} color="secondary">Delete</Button>
                    </ DialogActions>
                </ DialogContent>
            </Dialog>
            </div>

        );
  }

}

export default CommunityArticleDisplay;
