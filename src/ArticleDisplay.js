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

class ArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          // url: '',
           isStarred: false,
           isDialogOpen: false,
          // handleDialogClose: ()=> {},
           //ArticleName: '',
        }
    }


    handleDeleteDialogOpen = (doc) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isDeleteDialogOpen: true,
            selectedArticleDelete: doc,
        });
    }

    markRead = () => {
        this.props.articleRef.update({read: true});
    }

    handleDeleteDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isDeleteDialogOpen: false,
            selectedArticleDelete: "",
        });
    }

    handleStar = async (event) => {


        const target = event.target;
        console.log("Star Value: " + target.checked);
        const isStarred = !this.state.isStarred;

        this.setState({
                isStarred: isStarred
        });

       await firebase.firestore().collection("localArticles")
        .doc("users")
        .collection("ZoiGTzwfFugLUTUP9s6JbcpHH3C2") // hardcoded userid
        .doc("2nhPDNTTDFoYGgmFO4aD")
        .update({
            starred: target.checked
        });

    }

    handleOpenNewTab = (event) => {
        window.open(this.props.url);
        this.markRead();
    }

    handleDeleteArticle = async () => {

      const userid = firebase.auth().currentUser.uid;
     firebase.firestore().doc(`personalBoards/${userid}/pboards/${this.props.boardId}`)
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

      
    handleDialogOpen = () => {
        ///setState(prevState => {return {...prevState, isDialogOpen: true}});
        this.setState({
            isDialogOpen: true,
        })
    }

    handleDialogClose = () => {
        //setState(prevState => {return {...prevState, isDialogOpen: false}});
        this.setState({
            isDialogOpen: false,
        })
    }
    
 

    render() {

        return (

            <div>

            
            <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen}>
                    Preview 
            </Button>
        
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
                        <FormControlLabel
                            control={<Checkbox icon={<StarBorder />} checkedIcon={<Star />} checked={this.state.isStarred} onClick={this.handleStar} />}
                            label="Star"
                    />
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

export default ArticleDisplay;
