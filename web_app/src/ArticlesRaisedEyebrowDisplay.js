import React from 'react';
import firebase from "firebase";
import CommunityArticleDisplay from './CommunityArticleDisplay';

class ArticlesRaisedEyebrowDisplay extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            none: 0,
            articlesRaisedEyebrow: [],
        }
    }


    componentDidMount() {
        var user = firebase.auth().currentUser;
        try{
            firebase.firestore().collection('users').doc(user.uid)
            .onSnapshot((userDoc) => {
                
                const userInfo = userDoc.data();
                const articleIds = userInfo.articles_raised_eyebrow || [];
                //console.log("articleids ", articleIds);

                const artP = articleIds.map(artID =>
                    firebase.firestore().collection('communityArticles')
                    .doc(artID).get().then((articleDoc) => {
                        var artRef = firebase.firestore().collection('communityArticles').doc(artID);
                        return {
                        id: artID,
                        ref: artRef,
                        ...articleDoc.data()
                    }})
                );
                
                Promise.all(artP).then((articles) => {
                    const s = []
                    articles.forEach((article) => {
                        s.push(article)
                    })
                    this.setState({
                        articlesRaisedEyebrow: s,
                    });    
                })
            });
    }
    catch(err){
        console.log(err);
    }
}
    
    handleRefreshBoard = () => {
        // only used for delete
        // needed method since pass as a prop to CommunityArticleDisplay
        // do not need to do anything here since page will update automatically for us
        // as we have a listener in componentDidMount
    }

    render() {
        return(
        <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
            
            <h2>Raised Eyebrows</h2>
            <h3>Articles ({this.state.articlesRaisedEyebrow.length})</h3>

            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    this.state.articlesRaisedEyebrow.map((article) => {
                        return (
                            <div key={article.id} style={{display: 'inline', float: 'left', marginLeft: '1rem'}}>
                                <CommunityArticleDisplay
                                url={article.url}
                                ArticleName={article.name}
                                articleId={article.id}
                                articleRef={article.ref}
                                //only used for 'delete' of raised eyebrow article (lowers eyebrow)
                                inRaisedEyebrowPage={true}
                                //boardId={id}
                                eyebrowArr={article.users_eyebrows}
                                refreshBoard={this.handleRefreshBoard}
                                />
                            </div>
                        );
                    })
                }
            </div>
        </div> 
     
            
        );
    }
}

export default ArticlesRaisedEyebrowDisplay;