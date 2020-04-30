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
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { IconButton } from '@material-ui/core';
import { MenuBook } from '@material-ui/icons';


const styles = {
    article: {
        borderRadius: 5,
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.5)',
        backgroundColor: 'antiquewhite'
    },

    articleRead: {
        backgroundColor: 'grey'
    },

    content: {
        borderRadius: 7,
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.5)',
        border: 0,
    }
  };
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

    markRead(read) {
        this.props.articleRef.update({read});
    }

    render() {
        const { classes } = this.props;
        return (
        <div>
            <Paper elevation={3} 
              className={classes.article + " article " + (this.props.article.read ? classes.articleRead :"")}>
                <p className="article__name" style={{textAlign: 'center'}}>{this.props.ArticleName}</p>
                <img className="article__img" src="https://cdn4.iconfinder.com/data/icons/flat-circle-content/800/circle-edit-article-512.png" width="175" height="175" float="left"></img>
                <div className="article__viewButton">
                    <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen} style={{left: '1px'}}>
                        View
                    </Button>
                </div>
                <div className="article__markReadButton">
                    {this.props.article.read ?
                    <IconButton  variant="outlined" onClick={() => this.markRead(false)} title="Mark as unread"> 
                        <MenuBook color="disabled"></MenuBook>
                    </IconButton>
                    :
                    <IconButton variant="outlined" onClick={() => this.markRead(true)} title="Mark as read">
                        <MenuBook color="secondary"></MenuBook>
                    </IconButton>
                    }
                </div>
            </Paper>
            <br/>
            <Dialog
            open={this.state.isDialogOpen}
            fullWidth={true}
             classes={{content: classes.content}}
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

export default withStyles(styles) (StarredArticleDisplay);
