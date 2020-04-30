import React from 'react';
import firebase from "firebase";
import StarredArticleDisplay from './StarredArticleDisplay';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const styles = {
    titleBar: {
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.5)',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
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
            
            querySnapshot.forEach(function(doc) {
                var article = {
                    url: doc.data().url,
                    name: doc.data().name,
                    read: doc.data().read,
                    starred: doc.data().starred,
                    id: doc.id
                }
                articles.push(article);
               
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
                <AppBar  position="static" style={{background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', width: '400px'}}>
                    <Toolbar variant="dense">
                    <h3> Starred Articles ({this.state.articles.length})</h3>
                    </Toolbar>
                </AppBar>
               { this.state.articles.map((article) => {
                  return (
                <div className={article.read ? "article-read": "article-unread"} style={{ margin: '20px'}} >
                        <br></br>
                          <StarredArticleDisplay 
                            url={article.url} 
                            ArticleName={article.name}
                            articleStarred={article.starred}
                            articleId={article.id}
                            readStatus={article.read}
                        />
                        {/* </Paper> */}
                  </div> 
                  );
                }
        )}
        </div>
        );
        
    }

}

export default withStyles(styles) (StarredItems);