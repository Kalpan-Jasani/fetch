import React from 'react';
import { Typography, Button, CircularProgress, Avatar } from '@material-ui/core';
import firebase from "firebase";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
class CommentSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'articleID': props.articleID, 'newComment': "", saving: false, documents: [], docChanges: [], editIndex: undefined, editedComment: "", editMode: false, user: firebase.auth().currentUser}

        this.changeCommentHandler = this.changeCommentHandler.bind(this);
        this.changeEditCommentHandler = this.changeEditCommentHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
        this.submitEditHandler = this.submitEditHandler.bind(this);
        this.getFirstName = this.getFirstName.bind(this);
        this.getInitials = this.getInitials.bind(this);
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

    changeEditCommentHandler = (event) => {
        if (!this.state.saving) {
            this.setState({ editedComment: event.target.value });
        }
    }


    submitHandler = async (event) => {
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
                    comment: this.state.newComment,
                    timestamp: new Date(),
                    userid: user.uid,
                    photoURL: user.photoURL,
                    name: user.displayName,
                    edited: false
                });
            this.setState({
                saving: false,
                newComment: "",
            });
        }
    }

    submitEditHandler = async (commentID) => { 
        if (!this.state.saving) {
            this.setState({
                saving: true
            });
            
            await firebase.firestore()
                .collection('communityArticles')
                .doc(this.state.articleID)
                .collection('comments')
                .doc(commentID)
                .update({
                    comment: this.state.editedComment,
                    edited: true
                });
            this.setState({
                saving: false,
                editedComment: "",
                editMode: false,
                editIndex: undefined
            });
        }
    }

    deleteCommentHandler = async (commentID) => {
        if (!this.state.saving) {
            this.setState({
                saving: true
            });
            
            await firebase.firestore()
                .collection('communityArticles')
                .doc(this.state.articleID)
                .collection('comments')
                .doc(commentID)
                .delete();
            
            this.setState({
                saving: false,
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
                {this.state.documents.map((comment, index) => {
                    var data = comment.data();
                    return (
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', paddingBottom: 10}}>
                                <div style={{display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', paddingRight: 5}}>
                                    {data.photoURL === "" && data.name !== ""
                                        ? <Avatar>{this.getInitials(data.name)}</Avatar>
                                        : <Avatar src={data.photoURL} alt=""/>}
                                    <div style={{width: 5}} />
                                    <Typography
                                        style={{fontWeight: 500}}
                                    >
                                        {`${this.getFirstName(data.name)}: `}
                                    </Typography>
                                </div>
                                {this.state.editIndex === index && this.state.editMode
                                ?   <ValidatorForm
                                        instantValidate={true}
                                        onSubmit={this.changeEditCommentHandler}
                                    >
                                        <TextValidator 
                                            fullWidth
                                            variant="outlined"
                                            value={this.state.editedComment} 
                                            onChange={this.changeEditCommentHandler} 
                                            validators={['required']} 
                                            errorMessages={['Enter a valid comment']} 
                                            multiline
                                            rows={2}
                                            onKeyDown={(e) => {
                                                if (this.state.editedComment !== "" && e.keyCode === 13 && this.state.editedComment !== data.comment) {
                                                    e.preventDefault();
                                                    this.submitEditHandler(comment.id);
                                                }
                                            }}
                                        />
                                    </ValidatorForm>
                                : <Typography>{data.comment}</Typography>}
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
                                {data.userid === this.state.user.uid
                                ? <div>
                                    {this.state.editMode && this.state.editIndex === index
                                        ? <Button 
                                            onClick={() => {this.setState({editMode: false})}}
                                            color="secondary"
                                        >
                                            Cancel
                                        </Button>
                                        : <Button
                                            color="primary" 
                                            onClick={() => {this.setState({editMode: true, editIndex: index, editedComment: data.comment})}}
                                        >
                                            Edit
                                        </Button>}
                                    {this.state.editMode
                                    ? null
                                    : <Button color="secondary" onClick={() => this.deleteCommentHandler(comment.id)}>
                                        Delete
                                    </Button>}
                                </div>
                                : null}
                                {data.edited 
                                ? <div style={{flexGrow: 1, paddingLeft: 5}}>
                                    <Typography style={{fontSize: 10, fontWeight: 650}} color="primary">Edited</Typography>
                                </div>
                                : null}
                            </div>
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
                    <Button type="submit" color="primary">Post Comment</Button>
                </ValidatorForm>
            </div>
        );
  }
}
export default CommentSection;