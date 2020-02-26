import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

class ArticleDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           url: ''
        }
    }

    render() {

        return (
        <Card style={{maxWidth: 600, minHeight: 300 , margin: 25 }} >
            <CardContent>
                <iframe src="https://www.purdue.edu/registrar/calendars/2019-20-Academic-Calendar.html"  width="100%" height="500px" ></iframe>  {/*hardcoded url*/}
            </CardContent>
            <CardActions style={{ paddingLeft: 20 }}>
                <FormControlLabel
                    control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} value="checkedH" />}
                    label="Like"
                />
            </CardActions>
        </Card>
        );
  }

}

export default ArticleDisplay;