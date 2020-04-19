import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import firebase from "firebase";

class StarredArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
        }
        this.db = firebase.firestore();
        this.userid = firebase.auth().currentUser.uid;
    }


    handleOpenNewTab = (event) => {
        window.open(this.props.url);
    }

    /**
     * mark an article as being updated (or as seen) by setting current time as
     * the lastSeenTime field in the article in firebase
     * 
     * If error, console error is logged
     */
    markUpdated = async () => {
        const articleRef = this.db.doc(`localArticles/users/${this.userid}/${this.props.articleId}`);
        await articleRef.update({lastSeenTime: new Date()}).catch(
            (reason) => {
                console.error(`unable to update article with id: ${articleRef.id}`);
                console.error(reason);
            }
        );
    }

    handleDialogOpen = () => {
        this.setState({
            isDialogOpen: true,
        })
        this.markUpdated();
    }

    handleDialogClose = () => {
        this.setState({
            isDialogOpen: false,
        });
    }

    handleStar = (event) => {

        const userid = firebase.auth().currentUser.uid;
        const target = event.target;
        const isStarred = !this.props.articleStarred;
        
        firebase.firestore()
        .collection("localArticles")
        .doc("users")
        .collection(userid)
        .doc(this.props.articleId)
        .update({
            starred: isStarred
        });

       // window.location.reload();
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
                        <FormControlLabel
                                control={<Checkbox icon={<StarBorder />} checkedIcon={<Star />} checked={this.props.articleStarred} onClick={this.handleStar} />}
                                label="Star"
                        />
                        <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                        Go to Website
                        </Button>
                        <Button variant="contained" color="secondary" onClick={this.handleDialogClose} >
                        Close
                        </Button>
                    </ DialogActions>
                </ DialogContent>
            </Dialog>
            </div>

        );
  }

}

export default StarredArticleDisplay;
