import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import Button from '@material-ui/core/Button';
import firebase from "firebase";
import { green } from '@material-ui/core/colors';
import { useParams } from 'react-router-dom';
import { func } from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import { Avatar, DialogContentText, Link, Typography } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DeleteIcon from '@material-ui/icons/Delete';

import {blockedUser} from './util';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CommentSection from './CommentSection';

class CommunityArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           article: null,
           user: null,
           articlesRaisedEyebrow: [],
           vitalityCheck: false,       // does the article need to be hidden
           SaveDialogOpen: false,
           personalBoards: [],
           selectedBoards: [],

        }
        this.unsubscribe = null;
        this.db = firebase.firestore();
    }
    componentDidMount() {
        // subscribe to article updates
        if(!this.unsubscribe) {
            this.unsubscribe = this.props.articleRef.onSnapshot( async (doc) => {
                let userDoc = await (doc.data().user.get && doc.data().user.get());
                this.setState({
                    article: {
                        ...doc.data(),
                        users_eyebrows: doc.data().users_eyebrows || [],
                        id: doc.id,
                    },
                    user: {
                        ...userDoc && userDoc.data && userDoc.data(),
                        uid: doc.data().user && doc.data().user.id
                    }
                }, async () => {
                    const vitalityCheck = await this.displayableArticle();
                    this.setState({vitalityCheck});
                })
            });

            // sets the state of list of articles raised eyebrow for user
            var user = firebase.auth().currentUser;
            firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .onSnapshot(function(udoc) {
                var data = udoc.data();
                var articlesRE= data.articles_raised_eyebrow || [];
                this.setState({
                    articlesRaisedEyebrow: articlesRE || []
                });
            }.bind(this));

            // set state of personal boards
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
    }
    componentWillUnmount() {
        // unsubscribe to article updates
        this.unsubscribe();
    }

    handleOpenNewTab = (event) => {
        window.open(this.state.article.url);
    }

    handleDialogOpen = () => this.setState({isDialogOpen: true});
    handleDialogClose = () => this.setState({isDialogOpen: false});

    handleDeleteArticle = async () => {
        const props = this.props;
        const userid = firebase.auth().currentUser.uid;

        if(this.props.inRaisedEyebrowPage){
          // delete in RaisedEyebrow Page will be the same as lowering eyebrow
          this.handleLowerEyebrow();
        }
        else{       // any user can perform this?
          firebase.firestore().doc(`communityBoards/${this.props.boardId}`)
          .update({
              articles: firebase.firestore.FieldValue.arrayRemove(this.props.articleRef)
          })
          .then(function() {
              console.log("Article successfully deleted!");
          })
          .catch(function(error) {
              console.error("Error deleting article: ", error);
          });

          this.handleDialogClose();
        }
    }

    handleRaiseEyebrow = async () => {
        var user = firebase.auth().currentUser;
        var ebarr = this.state.article.users_eyebrows;
        ebarr.push(user.uid);

        var tempArticlesRE = this.state.articlesRaisedEyebrow;
        tempArticlesRE.push(this.props.articleRef.id);

        try{
            await this.props.articleRef.update({
                users_eyebrows: ebarr,
            });
            console.log("Raised Eyebrow!")

            // add to array of currentUser
            await firebase.firestore().collection('users').doc(user.uid).update({
                articles_raised_eyebrow: tempArticlesRE,
            });
            console.log("added to list of articles raised eyebrow")
        }
        catch(err){
            console.log(err);
        }
    }

    handleLowerEyebrow = async () => {
        var user = firebase.auth().currentUser;
        var ebarr = this.state.article.users_eyebrows;
        var index = ebarr.indexOf(user.uid);
        if (index > -1) {
            ebarr.splice(index, 1);
        } else {
            console.log("user did not raise an eyebrow");
        }
        //console.log(ebarr);

        var tempArticlesRE = this.state.articlesRaisedEyebrow;
        var index2 = tempArticlesRE.indexOf(this.props.articleRef.id);

        if (index2 > -1) {
            tempArticlesRE.splice(index2, 1);
        } else {
            console.log("user did not raise an eyebrow");
        }

        try {
            await this.props.articleRef.update({
                users_eyebrows: ebarr,
            });
            console.log("Lowered Eyebrow!");

            // remove from array of currentUser
            await firebase.firestore().collection('users').doc(user.uid).update({
                articles_raised_eyebrow: tempArticlesRE,
            });
            console.log("removed to list of articles raised eyebrow")

        }
        catch(err) {
            console.log(err);
        }
    }

    handleReport = () => {
        const user = firebase.auth().currentUser;
        const userRef = this.db.doc(`users/${user.uid}`);
        const report = window.prompt("Enter report");

        if(!report) {
            window.alert("nothing reported");
            return;
        }
        const user_report = {
            user: userRef,
            report
        }
        this.props.articleRef.update({
            user_reports: firebase.firestore.FieldValue.arrayUnion(user_report),
        });

    }

    displayableArticle = async () => {
        if(this.state.user) {
            if(await blockedUser(this.state.user.uid)) {
                return false;
            }
        }

        if(this.state.article) {
            if(this.state.article.user_reports.length > 2) {
                return false;
            }
        }

        return true;
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
            this.state.article !== null ?
                this.state.vitalityCheck ?
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left'}}>
                        <Typography variant='h4'>{this.state.article.name}</Typography>
                        <br></br>
                        <br/>
                        <Dialog
                            open={this.state.isDialogOpen}
                            fullWidth={true}
                            onClose={() => this.handleDialogClose()}
                            maxWidth={'md'}
                        >
                            <DialogTitle>
                                {this.state.article.name}
                                {this.state.user ? 
                                    <Avatar alt=" " src={this.state.user.photoURL} style={{left:"20px", position:"absolute"}} /> : <p> ... </p>
                                }
                                {this.state.user ? 
                                    <DialogContentText style={{left:"60px", position:"absolute"}}>{this.state.user.name} </DialogContentText> : <p> ... </p>
                                }
                            </DialogTitle>
                            <DialogContent style={{display: 'flex', flexDirection: 'row', paddingTop: 25}}>
                                <div style={{width: '60%', paddingRight: 15}}>
                                    <iframe src={this.state.article.url}  width="100%" height="500px" ></iframe>
                                    <DialogActions style={{ paddingLeft: 20 }}>
                                        {this.state.article.users_eyebrows.length.toString()}

                                        {(this.state.article.users_eyebrows).includes(firebase.auth().currentUser.uid) 
                                        ? <IconButton onClick={() => this.handleLowerEyebrow()}>
                                            <VisibilityIcon color="secondary"/>
                                        </IconButton>
                                        : <IconButton onClick={() => this.handleRaiseEyebrow()}>
                                            <VisibilityIcon color="disabled"/>
                                        </IconButton>}

                                        <Button variant="contained" color="primary" onClick={this.handleSaveDialogOpen}>
                                            Save 
                                        </Button>
                                        {/* dialog to save article to personal boards */}
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
                                        </Dialog>   {/* dialog to save article to personal boards */}
                                        <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                                            <OpenInNewIcon />
                                        </Button>
                                        <Button color="secondary" onClick={this.handleReport} >
                                            Report
                                        </Button>
                                        <Button onClick={() => this.handleDeleteArticle(this.state.selectedArticleDelete)} color="secondary">
                                            <DeleteIcon />
                                        </Button>
                                    </ DialogActions>
                                </div>
                                <CommentSection
                                    articleID={this.state.article.id}
                                />
                            </ DialogContent>
                        </Dialog>
                        <DialogContent>
                            <iframe src={this.state.article.url}  width="100%" height="600px" ></iframe>
                            <DialogActions style={{ paddingLeft: 795 }}>
                                {this.state.article.users_eyebrows.length.toString()}

                                {(this.state.article.users_eyebrows).includes(firebase.auth().currentUser.uid)
                                ? <IconButton onClick={() => this.handleLowerEyebrow()}>
                                    <VisibilityIcon color="secondary"/>
                                </IconButton>
                                : <IconButton onClick={() => this.handleRaiseEyebrow()}>
                                    <VisibilityIcon color="disabled"/>
                                </IconButton>}

                                <Button variant="contained" color="primary" onClick={this.handleSaveDialogOpen}>
                                    Save
                                </Button>
                                {/* dialog to save article to personal boards */}
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
                                </Dialog>   {/* dialog to save article to personal boards */}
                                <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                                    <OpenInNewIcon />
                                </Button>
                                <Button color="secondary" onClick={this.handleReport} >
                                    Report
                                </Button>
                                <Button onClick={() => this.handleDeleteArticle(this.state.selectedArticleDelete)} color="secondary">
                                    <DeleteIcon />
                                </Button>
                            </ DialogActions>
                        </ DialogContent>
                        <br/>
                    </div>
                    :
                    <div style={{color: 'grey'}}>! article is reported</div>
                :
                <p>Loading</p>
        );
  }
}
export default CommunityArticleDisplay;
