import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import firebase from "firebase";

class ArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           url: '',
           isStarred: false,
        }
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

    render() {
        
        return (
        <Card style={{maxWidth: 600, minHeight: 300 , margin: 25 }} >
            <CardContent>
                <iframe src="https://www.purdue.edu/registrar/calendars/2019-20-Academic-Calendar.html"  width="100%" height="500px" ></iframe>  {/*hardcoded url*/}
            </CardContent>
            <CardActions style={{ paddingLeft: 20 }}>
                <FormControlLabel
                    control={<Checkbox icon={<StarBorder />} checkedIcon={<Star />} checked={this.state.isStarred} onClick={this.handleStar} />}
                    label="Star"
                />
            </ CardActions>
        </Card>
        );
  }

}

export default ArticleDisplay;