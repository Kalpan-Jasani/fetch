import React from 'react';
import firebase from "firebase";
import StarredArticleDisplay from './StarredArticleDisplay';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    paper: {
        borderRadius: 5,
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.5)',
        border: 0,
        padding: '30px',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        // display: 'flex',
        // flexWrap: 'wrap',
        justifyContent: 'space-between',
        margin: '20px',
        width: '120px',
        height: '100px',
    }
  };

class StarredItems extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            articles: []
        }

        this.unsubscribe = undefined;
    }

    componentDidMount() {
        const userid = firebase.auth().currentUser.uid;

        this.unsubscribe = firebase.firestore()
        .collection("localArticles")
        .doc("users")
        .collection(userid)
        .where("starred", "==", true)
        .onSnapshot(function(querySnapshot) {
            var articles = [];
            console.log(querySnapshot);
            querySnapshot.forEach(function(doc) {
                var article = {
                    url: doc.data().url,
                    name: doc.data().name,
                    read: doc.data().read,
                    starred: doc.data().starred,
                    id: doc.id
                }
                articles.push(article);
                console.log(article);
            });
            this.setState({
                articles: articles,
            });
       }.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { classes } = this.props;
        return (
            <div style={{display: 'inline-block', margin: '20px'}}>
                <h3> Starred Articles ({this.state.articles.length})</h3>
               { this.state.articles.map((article) => {
                  return (
                <div className={article.read ? "article-read": "article-unread"} style={{ margin: '20px'}} >
                     <Paper elevation={3} className={classes.paper}>
                      <p1>{article.name}</p1>
                        <br></br>
                          <StarredArticleDisplay 
                            url={article.url} 
                            ArticleName={article.name}
                            articleStarred={article.starred}
                            articleId={article.id}
                            readStatus={article.read}
                        />
                        </Paper>
                  </div> 
                  );
                }
        )}
        </div>
        );
        
    }

}

export default withStyles(styles) (StarredItems);