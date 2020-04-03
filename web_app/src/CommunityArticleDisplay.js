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
import IconButton from '@material-ui/core/IconButton';

class CommunityArticleDisplay extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           Article: {},
           board: null,
           eyebrowArray: this.props.eyebrowArr,
           articlesRaisedEyebrow: []
        }
    }

    componentDidMount() {
        this._isMounted = true;
        // updates automatically when eyebrow is raised
        firebase.firestore()
        .collection("communityArticles")
        .doc(this.props.articleId)
        .onSnapshot(function(doc) {
            //console.log("Data ", doc.data())
            var data = doc.data();
            var eyebrowArr = data.users_eyebrows;
            if(this._isMounted){
                this.setState({
                    eyebrowArray: eyebrowArr,
                });
            }
            
        }.bind(this));

        // sets the state of list of articles raised eyebrow for user
        var user = firebase.auth().currentUser;
        firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(function(udoc) {
            var data = udoc.data();
            var articlesRE= data.articles_raised_eyebrow;
            if(this._isMounted){
                this.setState({
                    articlesRaisedEyebrow: articlesRE
                });
            }
        }.bind(this));


    }

    componentWillUnmount(){
        this._isMounted = false;
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

    handleRaiseEyebrow = async () => {
        var user = firebase.auth().currentUser;
        var ebarr = this.state.eyebrowArray;
        ebarr.push(user.uid);

        var tempArticlesRE = this.state.articlesRaisedEyebrow;
        tempArticlesRE.push(this.props.articleId);

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
        var ebarr = this.state.eyebrowArray
        var index = ebarr.indexOf(user.uid);
        if (index > -1) {
            ebarr.splice(index, 1);
        } else {
            console.log("user did not raise an eyebrow");
        }
        //console.log(ebarr);

        var tempArticlesRE = this.state.articlesRaisedEyebrow;
        var index2 = tempArticlesRE.indexOf(this.props.articleId);
        
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
                    
                    {this.state.eyebrowArray.length.toString()}

                    {(this.state.eyebrowArray).includes(firebase.auth().currentUser.uid) 
                    ? <IconButton onClick={() => this.handleLowerEyebrow()}>
                        <VisibilityIcon color="secondary"/>
                    </IconButton>
                    : <IconButton onClick={() => this.handleRaiseEyebrow()}>
                        <VisibilityIcon color="disabled"/>
                    </IconButton>}
         
                        <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                        Go to Website
                        </Button>
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
