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
import { Avatar, DialogContentText } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

class CommunityArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           article: null, 
           user: null
        }
        this.unsubscribe = null;
    }
    componentDidMount() {
        // subscribe to article updates
        if(!this.unsubscribe) {
            this.unsubscribe = this.props.articleRef.onSnapshot( async (doc) => {
                let userDoc = await doc.data().user.get();
                this.setState({
                    article: {
                        ...doc.data(),
                        id: doc.id,
                    },
                    user: userDoc.data()
                })
            });
        }
    }
    componentWillUnmount() {
        // unsubscribe to article updates
        this.unsubscribe();
    }
   
    handleOpenNewTab = (event) => {
        window.open(this.state.article.url);
        this.markRead();
    }
   
    handleDialogOpen = () => this.setState({isDialogOpen: true});
    handleDialogClose = () => this.setState({isDialogOpen: false});
   
    render() {
        return (
            this.state.article !== null ?
                <div>
                    <span>{this.state.article.name}</span>
                    <br></br>
                    <Button variant="contained" color="secondary"  onClick={this.handleDialogOpen} style={{marginTop:"15px"}}>
                            Preview
                    </Button>
                    <br/>
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
                            {/* <div style={{ display:"block"}}> */}
                            {this.state.user ? 
                                <Avatar alt=" " src={this.state.user.photoURL} style={{left:"20px", position:"absolute"}} /> : <p> ... </p>
                            }
                            {this.state.user ? 
                                <DialogContentText style={{left:"60px", position:"absolute"}}>{this.state.user.name} </DialogContentText> : <p> ... </p>
                            }
                            {/* </div> */}
                            <VisibilityIcon />
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
                :
                <p>Loading</p>
        );
  }
}
export default CommunityArticleDisplay;