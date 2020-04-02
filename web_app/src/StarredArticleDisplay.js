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


class StarredArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           isDialogOpen: false,
           Article: {},
           isStarred: false,
        }
    }

    componentDidMount() {
        this.props.articleRef.get()
        .then((doc)=> {  //DocSnapshot
            if (doc.exists) {
                const data = doc.data();
                this.setState({
                    isStarred: data.starred
            });
    
            } else {
                // snapshot.data() will be undefined in this case
                console.log("No such document!");
               
            }       
        });
    }

    handleOpenNewTab = (event) => {
        window.open(this.props.url);
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

    handleStar = async (event) => {
    
        const target = event.target;
        const isStarred = !this.state.isStarred;
        await this.props.articleRef.update({starred: isStarred});
        this.setState({
            isStarred: isStarred
        });

        window.location.reload();
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
                                control={<Checkbox icon={<StarBorder />} checkedIcon={<Star />} checked={this.state.isStarred} onClick={this.handleStar} />}
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
