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
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton'
import { MenuBook } from '@material-ui/icons';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import BookIcon from '@material-ui/icons/Book';

import axios from 'axios';

import encodeUrl from 'encodeurl';

import './article.css';
import { Paper } from '@material-ui/core';

const styles = {
    article: {
        borderRadius: 5,
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.5)',
        backgroundColor: 'antiquewhite'
    },

    articleRead: {
        backgroundColor: 'grey'
    }
  };


class ArticleDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
           isDialogOpen: false,
           article: null,
           imageURL: null
        }

        this.unsubscribe = null;
        this.db = firebase.firestore();
        this.userid = firebase.auth().currentUser.uid;
    }

    componentDidMount() {
        if(!this.unsubscribe) {     // not having a previous subscription
            // subscribe to article updates
            this.unsubscribe = this.props.articleRef.onSnapshot(async (doc) => {
                let imageURL = null;
                const article = {
                    ...doc.data(),
                    id: doc.id,
                }
                try {
                    const encodedURI = encodeURI("https://us-central1-fetch-c97bc.cloudfunctions.net/obtainWebsitePreview?url="+
                        article.url);
                    // get the first favicon
                    imageURL = (await axios.get(encodedURI)).data.favicons[0];
                }
                catch (e) {
                    imageURL = null;
                }

                this.setState({article, imageURL});
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

    handleAddToQueue = (event) => {
        if(event.target.value == 1){
            this.props.addToQueue(this.props.articleRef, true);
        } else {
            this.props.addToQueue(this.props.articleRef, false);
        }
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
        const { classes } = this.props;
        return (
            this.state.article !== null ?
                <div>
                    <Paper elevation={3}
                      className={this.props.classes.article + " article " + (this.state.article.read ? 
                      this.props.classes.articleRead:"")}>
                        <div className="article__name">
                            {this.state.article.name}
                        </div>
                        <img className="article__img img" 
                            src={this.state.imageURL ||
                                "https://cdn4.iconfinder.com/data/icons/flat-circle-content/800/circle-edit-article-512.png"
                                }>
                        </img>
                        <div className="article__viewButton">
                            <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen}>
                                View
                            </Button>
                        </div>
                        <div className="article__markReadButton">
                            {this.state.article.read ?
                            <IconButton  variant="outlined" onClick={this.handlemarkUnread} title="Mark as unread"> 
                                <MenuBook color="disabled"></MenuBook>
                            </IconButton>
                            :
                            <IconButton variant="outlined" onClick={this.handlemarkRead} title="Mark as read">
                                <MenuBook color="secondary"></MenuBook>
                            </IconButton>
                            }
                        </div>
                    </Paper>
                    <Dialog
                    open={this.state.isDialogOpen}
                    fullWidth={true}
                    onClose={this.handleDialogClose}
                    >
                        <DialogTitle>
                            {this.state.article.name}
                        </DialogTitle>
                        <DialogContent >
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
                                    <FormControl >
                                        <InputLabel >Add To Queue</InputLabel>
                                            <Select
                                                onChange={this.handleAddToQueue}
                                                style={{
                                                padding: '12px 26px 10px 12px',
                                                fontSize: '16',
                                                width: '100px',
                                                height: '40px',
                                                marginBottom: '20px',
                                                }}
                                            >
                                                <MenuItem value={1}>Front</MenuItem>
                                                <MenuItem value={2}>End</MenuItem>
                                            </Select>
                                    </FormControl>
                                }
                                <Button variant="contained" color="primary" onClick={this.handleOpenNewTab}>
                                Go to Website
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

export default withStyles(styles) (ArticleDisplay);
