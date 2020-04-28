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


const styles = (theme) => ({
  root: {
    display: 'block',
    height: '100%'
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
           showbutton: true,
        }
    }

    componentDidMount() {
            var queue = [];
            var position = 0;
            this.props.queue.map(queueRef => {
              queueRef.onSnapshot((doc) => {
                let queueItem = {...doc.data(), id: doc.id, position: position} 
                if(position === 0) {
                  this.setState({
                    current: queueItem,
                  });
                }
                position++
               queue.push(queueItem)
            })
            
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
        position = position+1;
        this.state.queueItem.map(article => {
          if(article.position === position) {
              this.setState({
                current: article,
              })
          } 
        })
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
                                  {this.state.queueItem.length} items in the queue
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
                                <Button variant="contained" color="primary" onClick={this.handleOpenNewTab} style={{width: '200px', margin: '20px', right:'-350px'}}>
                                    Go to Website
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