import React from 'react';
import firebase from "firebase";
import StarredArticleDisplay from './StarredArticleDisplay';

class StarredItems extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            articles: []
        }
    }

    componentDidMount() {
        const userid = firebase.auth().currentUser.uid

        firebase.firestore()
        .collection("localArticles")
        .doc("users")
        .collection(userid)
        .where("starred", "==", true)
        .onSnapshot(function(querySnapshot) {
            var articles = [];
            console.log(querySnapshot);
            querySnapshot.forEach(function(doc) {
                articles.push(doc.data());
                console.log(doc.data());
            });
            this.setState({
                articles: articles,
            });
       }.bind(this));
}

    render () {

        return (
                
                this.state.articles.map((article) => {
                  return (
                <div className={article.read ? "article-read": "article-unread"} style={{display: 'inline', float: 'left'}}>
                    <ul>
                      <li>{article.name}</li>
                    </ul>
                        
                          <StarredArticleDisplay 
                            // isDialogOpen={state.isDialogOpen} 
                            // handleDialogClose={handleDialogClose} 
                            url={article.url} 
                            ArticleName={article.name}
                            articleId={article.id}
                            articleRef={article.ref}
                        //    boardId= {null}
                            //  addToQueue={addToQueue}
                            //  refreshBoard={handleRefreshBoard}
                            readStatus={article.read}
                        />
                  </div> 
                  );
                }
        ));
        
    }

}

export default StarredItems;