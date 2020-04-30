import React from 'react';
import firebase from "firebase";
import StarredArticleDisplay from './StarredArticleDisplay';
import { Typography } from '@material-ui/core';

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
        return (
            <div className="page-container">
                <Typography variant="h4" component="h1">
                    Starred Articles ({this.state.articles.length})
                </Typography>
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

export default StarredItems;