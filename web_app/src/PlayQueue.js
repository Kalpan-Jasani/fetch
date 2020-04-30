import React from 'react';
import firebase from "firebase";
import { withStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from '@material-ui/core/Button';
import { CSSTransition } from 'react-transition-group';
import CloseIcon from '@material-ui/icons/Close';
import { blue } from '@material-ui/core/colors';


const styles = (theme) => ({
  root: {
    display: 'block',
    height: '100%',
    borderRadius: 7,
  //  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  },
  row: {
    display: 'table',
    width: "100%", /*Optional*/
    tableLayout: 'fixed', /*Optional*/
    borderSpacing: '10px', /*Optional*/
  },
  column: {
    display: 'table-cell',
    width: '10px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
   // backgroundColor: 'black',
  },
  content: {
    flex: '1 0 auto',
    height: '20px',
    backgroundColor: '#4CAF50',
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  });

class PlayQueue extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
           queueItem: [],
           current: {},
           open: this.props.open,
        }

        this.unsubscribes = [];
    }

    componentDidMount() {
            var queue = [];
            var position = 0;
            console.log(this.props.size)
            this.props.queue.map(queueRef => {
             const unsubscribe = queueRef.onSnapshot((doc) => {
                let queueItem = {...doc.data(), id: doc.id, position: position} 
                if(position === 0) {
                  this.setState({
                    current: queueItem,
                  });
                }
                position++
               queue.push(queueItem)
            })
            this.unsubscribes.push(unsubscribe)
          });
          this.setState({
            queueItem: queue,
        })
   }

   componentWillMount() {
     document.addEventListener('mousedown',this.handleClick, false);
   }

   componentWillUnmount() {
     document.removeEventListener('mousedown',this.handleClick, false);
    // this.unsubscribes()
   }

   handleClick = (e) => {
     if(this.node.contains(e.target)) {
       //contine
       return;
     }

     this.props.stop();
   }

   navigateBackward = () => {
        var position = this.state.current.position
        if(position === 0){

        } else {
          position = position-1;
          this.state.queueItem.map(article => {
            if(article.position === position) {
                this.setState({
                  current: article,
                })
            } 
          })
        }
    }
  
   navigateForward = () => {
        var position = this.state.current.position
        if(position == this.state.queueItem.length-1){ // last element
            this.handleclose()
        } else {
          position = position+1;
          this.state.queueItem.map(article => {
            if(article.position === position) {
                this.setState({
                  current: article,
                })
            } 
          })
        }
   } 

   handleOpenNewTab = (event) => {
    window.open(this.state.current.url);
}

   play = () => {
    this.setState({
      open: true,
    })
  }

  handleclose = () => {
    this.props.stop();
  }

  handleDelete = (event) => {
    this.props.remove(this.state.current)
    this.navigateForward()
  }

    render() {
        const { classes } = this.props;
        
        return (
          <div ref={node => this.node = node} style={{marginTop: '20px'}}>
              {/* {this.state.showbutton && (
                  <Button variant="contained" style={{backgroundColor: 'green'}} onClick={this.play}>
                    Play
                  </Button>
              )} */}
              <CSSTransition
                  in={this.state.open}
                  timeout={300}
                  classNames="alert"
                  unmountOnExit
                  onEnter={() => this.setState({showbutton: false})}
                  onExited={() => this.setState({showbutton: true})}
              >
                  <div>
                      <Card className={classes.root} raised="true" >
                        <div className={classes.details}>
                            <CardContent className={classes.content}>
                                <Typography component="h7" variant="h7" style={{float: 'left'}}>
                                    {this.props.size} Items in the Queue
                                </Typography>
                                <IconButton color="secondary" style={{float: 'right' , top: '-12px' }} onClick={this.handleclose}>
                                   <CloseIcon />
                                </IconButton>
                            </CardContent>
                            <Typography component="h6" variant="h6" style={{paddingLeft: '50px'}} >
                                  {this.state.current.name}
                            </Typography>
                            <div className={classes.row}>
                                <IconButton color="secondary" onClick={this.navigateBackward} className={classes.column} component="span">
                                    <SkipPreviousIcon />
                                </IconButton>
                                <div  style={{display: 'block', size:'100px',height:'400px', margin: '0 20px 0 20px'}}>
                                    <iframe src={this.state.current.url}  width="100%" height="550px"></iframe>
                                </div>
                                <IconButton color="secondary" onClick={this.navigateForward} className={classes.column} component="span">
                                    <SkipNextIcon />
                                </IconButton>
                            </div>
                            <CardActions>
                                <Button variant="contained" color="primary" onClick={this.handleOpenNewTab} style={{width: '200px',  right: '-80px'}}>
                                    Go to Website
                                </Button>
                                <Button variant="contained" color="secondary" onClick={this.handleDelete} style={{width: '200px', margin: '20px', right: '-100px'}}>
                                    Remove From Queue
                                </Button>
                            </CardActions>
                        </div>
                      </Card>
                  </div>
              </CSSTransition>
          </div> 
        )}
}

export default withStyles(styles) (PlayQueue);