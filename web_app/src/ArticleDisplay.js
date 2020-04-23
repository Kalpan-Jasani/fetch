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


class ArticleDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           article: null
        }

        this.unsubscribe = null;
        this.db = firebase.firestore();
        this.userid = firebase.auth().currentUser.uid;
    }

    componentDidMount() {
        if(!this.unsubscribe) {     // not having a previous subscription
            // subscribe to article updates
            this.unsubscribe = this.props.articleRef.onSnapshot((doc) => {
                this.setState({
                    article: {
                        ...doc.data(),
                        id: doc.id,
                    }
                })
            });
        }
    }

    componentWillUnmount() {
        // unsubscribe to article updates
        this.unsubscribe();
    }

    handleDeleteDialogOpen = (doc) => {
        console.log("DOC ID: ", doc)
        this.setState({
            isDeleteDialogOpen: true,
        });
    }

    markRead = () => {
        this.props.articleRef.update({read: true});
    }

    handleDeleteDialogClose = () => {
        // closes the dialog for delete
        this.setState({
            isDeleteDialogOpen: false,
        });
    }

    handleStar = async (event) => {
        await this.props.articleRef.update({starred: !this.state.article.starred});
    }

    handleOpenNewTab = (event) => {
        window.open(this.state.article.url);
        this.markRead();
    }

    handleDeleteArticle = async () => {
        this.props.boardRef.update({
            articles: firebase.firestore.FieldValue.arrayRemove(this.props.articleRef)
        })
        .then(function() {
            console.log("Article successfully deleted!");
        })
        .catch(function(error) {
            console.error("Error deleting article: ", error);
            alert("could not delete article");
        });

        this.handleDialogClose();
    }

    handleDialogOpen = () => {
        this.setState({isDialogOpen: true});
        this.markUpdated();   
    }

    handleDialogClose = () => this.setState({isDialogOpen: false});

    handlemarkUnread = () => {
        this.props.articleRef.update({read: false});
    }

    handlemarkRead = () => {
        this.props.articleRef.update({read: true});
    }

    handleAddToQueue = () => {
        this.props.addToQueue(this.props.articleRef, false);
    }

    /**
     * mark an article as being updated (or as seen) by setting current time as
     * the lastSeenTime field in the article in firebase
     * 
     * If error, console error is logged
     */
    markUpdated = async () => {
        await this.props.articleRef.update({lastSeenTime: new Date()}).catch(
            (reason) => {
                console.error(`unable to update article with id: ${this.props.articleRef.id}`);
                console.error(reason);
            }
        );
    }

    render() {
        return (
            this.state.article !== null ?
                <div className={this.state.article.read ? "article-read":""}>
                    <div style={{width: '200px', height: '200px'}}>{this.state.article.name}</div>
                    <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen}>
                            Preview
                    </Button>
                    <br/>
                    {this.state.article.read ?
                    <Button variant="outlined" onClick={this.handlemarkUnread}> Mark Unread </Button>
                    :
                    <Button variant="outlined" onClick={this.handlemarkRead}> Mark Read </Button>
                    }

                    <Dialog
                    open={this.state.isDialogOpen}
                    fullWidth={true}
                    >
                        <DialogTitle>
                            {this.state.article.name}
                        </DialogTitle>
                        <DialogContent>
                            <iframe src={this.state.article.url}  width="100%" height="500px" ></iframe>

                            <DialogActions style={{ paddingLeft: 20 }}>
                                <FormControlLabel
                                    control={<Checkbox 
                                        icon={<StarBorder />} 
                                        checkedIcon={<Star />} 
                                        checked={this.state.article.starred} 
                                        onClick={this.handleStar} />}
                                    label="Star"
                            />

                                { this.props.addToQueue &&
                                    <Button variant="contained" color="primary" onClick={this.handleAddToQueue}>
                                        Add to queue
                                    </Button>
                                }
                                <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                                Go to Website
                                </Button>
                                <Button variant="contained" color="secondary" onClick={this.handleDialogClose} >
                                Close
                                </Button>
                                { this.props.boardRef &&    // delete option only if a board is provided
                                    <Button onClick={() => this.handleDeleteArticle()} color="secondary">Delete</Button>
                                }
                            </ DialogActions>
                        </ DialogContent>
                    </Dialog>
                </div>
                :
                <p>Loading</p>
        );
  }
}

export default ArticleDisplay;
