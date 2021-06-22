import React, {useState} from 'react';

import {Row, Col} from 'reactstrap';
import {Spinner} from 'reactstrap';
import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    Button,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
    CardFooter,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { InView } from 'react-intersection-observer';

import upDone from '../../assets/upDone.png';
import upNone from '../../assets/upNone.png';
import starDone from '../../assets/starDone.png';
import starNone from '../../assets/starNone.png';

import pop from '../../assets/pop.mp3';
import unPop from '../../assets/unPop.mp3';

import followSound from '../../assets/followSound.wav';


import api from '../../constants/api';
import Carousel from 'react-elastic-carousel';
import Video from 'react-responsive-video';




import './PostItem.css'





const imageItem = (med)=>{
    let path = api.cdn+ api.postMedia.p720+med
    return(
        <div style={{background:'url('+path+')',backgroundSize: 'cover',backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat', minHeight:'500px', minWidth:'100%'}} onClick={()=>{
        }}>  
        </div>
    )
}
const videoItem = (med, inView)=>{
    let path = api.cdn+ api.postMedia.p720+med
    return(
        <div id="cauta" style={{display:'flex',alignItems:'center',minHeight:'500px', minWidth:'100%', backgroundColor:'#303030'}}>
        <Video
        style={{maxHeight:'500px'}}
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
    )
}

function mediaMap(media){
   return media.map(element=>{
        if(element.split('.')[1]==='mp4'){
            //return video item
           return(videoItem(element))
        }else {
            //return img item
            return(imageItem(element))
        }
    })
}

function newShowCarousel(media, inView){
    if(media.length<1)
    return;

    return(
        <Carousel
        itemsToShow={1}
        showArrows={media.length===1?true:true}
        disableArrowsOnEnd={false}
        showArrows={false}
        enableMouseSwipe={false}>
            { 
            mediaMap(media, inView)
            }
        </Carousel>
 
    )
}



const PostItem = (props) => {
    //console.log('POSTITEM PROPS ', props.post)
    const [update, setUpdate] = useState(false);
    const [showScreenDialog, setshowScreenDialog] = useState(false);
    const [upVoted, setupVote] = useState(() => {
        return props.post.usrUpVoted || false;
    });
    const [follow, setFollow] = useState(() => {
        return props.post.usrFollow || false;
    });
    const [upNumber, setupNumber] = useState(() => {
        return props.post.upVotes || 0;
    });
    const [followNum, setFollowNum] = useState(() => {
        return props.post.followers || 0
    })
    const [post, setPost] = useState(() => {
        return props.post || null
    })
    const [yes, setYes] = useState(true)

    if (post === null || post === undefined) {
        return (
            <Spinner/>)
    }
   const handleClose = ()=>{
       setshowScreenDialog(false);
   }
    return (
        <div>
        <Card 
        className="background-component"
        style={
            {
                marginTop: '2vh',
                borderRadius: '10px'
            }
        }>
            <CardBody>
                <CardTitle className=" notifications-button" onClick={()=>{
               // window.location.assign('/post/'+post._id.toString())
               }}>
                   <a href={'/post/'+post._id.toString()}>
                    <span className="text-header2 text-color">
                        {
                        post.header.length > 40 ? post.header.substring(0, 40) + "..." + ' ::'+post.category : post.header + ' ::'+ post.category
                    }</span>
                    </a>
                </CardTitle>
                <CardSubtitle>
                    <a className="change-cursor text-color" style={{ textDecoration:'none'}} href={'/user/'+post.postedBy}>@{post.postedByUsername}</a>
                </CardSubtitle>
                <CardBody className=""
                    style={
                        {maxHeight: '50%'}
                }>
                     <InView>
                     {({ inView, ref, entry }) => (
                 <div ref={ref}>
                                {newShowCarousel(post.media, inView)}
                                 </div>
                      )}
                         </InView>
                </CardBody>
                <CardBody>
                    <span className="float-left" style={{textAlign:'left'}}>
                        {
                        post.body.length > 200 ? post.body.substring(0, 200) + "..." : post.body
                    }</span>
                </CardBody>
            </CardBody>

            <CardFooter className="card-footer-accent">
                <Row>
                    <Col>
                        <img className="change-cursor votes"
                            src={
                                upVoted ? upDone : upNone
                            }
                            onClick={
                                async () => {
                                    let url = api.backaddr + '/api/up?id=' + post._id.toString()
                                    let options = {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Cache-Control": "no-cache, no-store, must-revalidate",
                                            Pragma: "no-cache",
                                            token: localStorage.getItem("token").toString()
                                        }
                                    };
                                    let audio = new Audio(upVoted ? unPop : pop);
                                    audio.play();

                                    setupVote(!upVoted)
                                    let newUp = upNumber
                                    newUp += upVoted?(-1):(+1)
                                    setupNumber(newUp)
                                    //post.upVotes += post.usrUpVoted ? (-1) : (+ 1);
                                   // post.usrUpVoted = !post.usrUpVoted;

                                    setUpdate(!update);
                                    fetch(url, options);
                                }
                        }></img>
                         &nbsp;
                    <span>{
                       upNumber
                    }</span>
                </Col>

                <Col>
                    <img className="change-cursor votes"
                        src={
                            post.usrFollow ? starDone : starNone
                        }
                        onClick={
                            async () => {
                                let url = api.backaddr + '/api/follow?id=' + post._id.toString()
                                let options = {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Cache-Control": "no-cache, no-store, must-revalidate",
                                        Pragma: "no-cache",
                                        token: localStorage.getItem("token").toString()
                                    }
                                };
                                if(!post.usrFollow){
                                let audio = new Audio(followSound)
                                audio.volume=0.5
                                audio.play()
                                }
                                
                                post.followers += post.usrFollow ? (-1) : (+ 1);
                                post.usrFollow = !post.usrFollow
                                setUpdate(!update)
                                fetch(url, options);
                            }
                    }></img>
                    &nbsp;
                <span>{
                    post.followers
                }</span>
            </Col>
        </Row>
    </CardFooter>
</Card>

</div>
    )


}





export default PostItem;
