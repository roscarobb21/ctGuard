import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Row, Col, Spinner} from 'reactstrap';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import ctLogo from '../../assets/security.png'
import api from '../../constants/api'
import Carousel, {consts} from 'react-elastic-carousel';
import ReactResizeDetector from 'react-resize-detector';
import './LargeMediaViewer.css'
import { SignalCellularNullSharp } from '@material-ui/icons';


import { InView } from 'react-intersection-observer';
import Video from 'react-responsive-video';

import PlaceImg from '../../assets/global.png';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
 

function LargeMedia(props){
    const [showDialog, setShowDialog]= useState(props);
    const [media, setMedia] = useState(props);
    const elementRef = useRef(null)
   
    const [height, setHeight]= useState(0);
    const [flag, setFlag] = useState(0);
    const [mountCarousel, setMountCarousel] = useState(false);
    const [carouselHeight, setCarouselHeight] = useState(0);
    const [expandId, setExpandId] = useState(null);
 
    const childrenRef = useRef(null);

    var parentHeight = null;

    const parentRef = useCallback(node => {
      if (node !== null) {
        setHeight(node.offsetHeight);
      }
    },[]);

    const carouselRef = useCallback(node => {
      if (node !== null) {
        node.goTo(Number(expandId))
      }
    },[expandId]);
    


    React.useEffect(() => {
      setExpandId(props.expandId);
      
  }, [props.expandId])

    React.useEffect(() => {
        setShowDialog(props.showDialog);
    }, [props.showDialog])
    React.useEffect(() => {
        setMedia(props.media);
    }, [props.media])



    useEffect ( () => {
      
        if(parentRef.current){
          parentHeight = parentRef.current.offsetHeight;
          let parentWidth  = parentRef.current.offsetWidth;
          setCarouselHeight(parentHeight);
          setMountCarousel(true);
      }else{
          setCarouselHeight(0);
      }

  }, [parentRef]);


    const handleCloseDialog = ()=>{
        props.parentCallback(!showDialog);
        setShowDialog(!showDialog)
    }
    if(props.showDialog !== showDialog){
        setShowDialog(props.showDialog)
    }
  

    return(
      
            <Dialog fullScreen open={showDialog} onClose={handleCloseDialog} TransitionComponent={Transition}>
            <AppBar style={{backgroundColor:'white !important'}}>
              <Toolbar>
                <IconButton style={{outline:'none !important'}} edge="start" color="inherit" onClick={handleCloseDialog} aria-label="close">
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" >
                  <img style={{width:'64px', height:'64px', padding:'10px'}}src={ctLogo}></img>ctGuard Media
                </Typography>
              </Toolbar>
            </AppBar>
            <Row style={{marginTop:'80px', minHeight:'calc(100vh - 100px)', maxHeight:'calc(100vh - 100px)'}}>
                <Col  className="d-flex" xs="12" sm="12" md="12" lg="10" xl="10" style={{width:'inherit', height:'inherit'}}>
               
               
                <div ref={parentRef} id="large-wrapper" style={{backgroundColor:"#393e46", minWidth:'100%', minHeight:'100%', maxWidth:'100%', maxHeight:'100%'}} className="">
               {height!== 0 &&
                 <Carousel
                 ref={carouselRef}
                 className="large-carousel"
                 style={{}}
             itemsToShow={1}
             contain={true}
             showArrows={true}
             disableArrowsOnEnd={false}
             showArrows={true}
             enableMouseSwipe={false}>
              {mediaMap(media, height)} 
             </Carousel>}
             {height===0 && <Spinner/>}
                    </div>
                    
                </Col>
                <Col  className="d-flex justify-content-center background-component" xs="12" sm="12" md="12" lg="2" xl="2">
                <div className="align-self-center" style={{ minWidth:'100%', minHeight:'100%'}}>
                  <div style={{marginTop:'30px', padding:'10px'}}>
                <img src={PlaceImg} style={{width:'32px', height:'32px'}}></img><span>&nbsp;{props.country},&nbsp;{props.region}</span>
                <hr></hr>
                   <span>@{props.username}</span>
                   </div>
                    </div>
                </Col>
            </Row>
          </Dialog>
       )

     
}

const mediaMap = (media, height)=>{
  
  return media.map(element=>{
    let ext = element.split('.')[1];
    if(ext === 'mp4'){
      
    let path = api.cdn+ api.postMedia.p1080+element
      return(
        <div className="" style={{backgroundColor:'#393e46', minWidth:'100%', minHeight:height, maxWidth:'100%', maxHeight:height}}> 
          <InView>
                     {({ inView, ref, entry }) => (
                 <div ref={ref}>
                                    <Video
        style={{maxHeight:'100%'}}
        controls
        autoplay={inView}
        muted={true}
        mp4={path}
        width={'100%'}
        height={'100%'}
        objectFit={`contain`}
        alt="Video Loading"
        />
                                 </div>
                      )}
                         </InView>  
        </div>
      )
    }
    return(
      <div className="" style={{backgroundColor:'#393e46', minWidth:'100%', minHeight:height, maxWidth:'100%', maxHeight:height}}> 
      <img src={api.cdn+api.postMedia.p1080+element} style={{width:'100%', height:'100%',objectFit:'contain'}}></img>
      </div>
    )
  })
}





export default LargeMedia;