import React from 'react';
import { Typography, Button, CircularProgress, Avatar } from '@material-ui/core';
import firebase from "firebase";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';

import {getDisplayName} from './util';

class CommentSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'articleID': props.articleID, 'newComment': "", saving: false, documents: [], docChanges: []}

        this.changeCommentHandler = this.changeCommentHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.getFirstName = this.getFirstName.bind(this);
        this.getInitials = this.getInitials.bind(this);
        this.db = firebase.firestore();
        this.userid = firebase.auth().currentUser.uid;
    }

    componentDidMount() {
        firebase.firestore()
        .collection('communityArticles')
        .doc(this.state.articleID)
        .collection('comments')
        .orderBy('timestamp')
        .onSnapshot(async (querySnapshot) => {
            this.setState({
                documents: querySnapshot.docs,
                docChanges: querySnapshot.docChanges(),
            });
        }).bind(this);
    }

    changeCommentHandler = (event) => {
        if (!this.state.saving) {
            this.setState({ newComment: event.target.value });
        }
    }

    submitHandler = async (event) => {
        const comment = this.state.newComment;
        const name = await getDisplayName();        // get displayable name

        if (!this.state.saving) {
            this.setState({
                saving: true
            });
            var user = firebase.auth().currentUser;
            await firebase.firestore()
                .collection('communityArticles')
                .doc(this.state.articleID)
                .collection('comments')
                .add({
                    name, comment,
                    timestamp: new Date(),
                    userid: user.uid,
                    photoURL: user.photoURL,
                    edited: false
                });

            /* notify other users of new comment on this thread */
            await this.props.notifyComment({
                user: user.uid,
                name, comment,
                timestamp: new Date()
            });

            this.setState({
                saving: false,
                newComment: "",
            });
        }
    }

    getInitials = (string) => {
        var names = string.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }

    getFirstName = (string) => {
        var split = string.split(' ');
        if (split.length > 1) {
            return split[0];
        }
        
        return string;
    }
   
  
    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', width: "40%"}}>
                <Typography
                    style={{fontWeight: 700}}
                >
                    Comments
                </Typography>
                <div style={{height: 10}}/>
                <div style={{flexGrow: 1}}>
                {this.state.documents.map((comment) => {
                    var data = comment.data();
                    return (
                        <div style={{display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', paddingBottom: 10}}>
                            <div style={{display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', paddingRight: 5}}>
                                {data.photoURL === "" && data.name !== ""
                                    ? <Avatar>{this.getInitials(data.name)}</Avatar>
                                    : <Avatar src={data.photoURL} alt=""/>}
                                <div style={{width: 5}} />
                                <Typography
                                    style={{fontWeight: 500}}
                                >
                                    {`${this.getFirstName(data.name || "")}: `}
                                </Typography>
                            </div>
                            <Typography>{data.comment}</Typography>
                        </div>
                    )
                })}

                </div>
                <ValidatorForm
                    onSubmit={this.submitHandler}
                    instantValidate={false}
                >
                    <TextValidator 
                        fullWidth
                        variant="outlined"
                        label="Add Comment" 
                        value={this.state.newComment} 
                        onChange={this.changeCommentHandler} 
                        validators={['required']} 
                        errorMessages={['Enter a valid comment']} 
                        multiline
                        rows={2}    
                    />
                    <Button type="submit">Post Comment</Button>
                </ValidatorForm>
            </div>
        );
  }
}
export default CommentSection;