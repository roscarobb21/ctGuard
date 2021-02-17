import React, {useState} from 'react';
import {
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption,
    Card,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
    Row, 
    Col
} from 'reactstrap';
import ReactPlayer from 'react-player';
import Carousel from 'react-elastic-carousel';
/**
 * upvote svg
 */
import upNone from '../../assets/upNone.svg';
import upDone from '../../assets/upDone.svg';
/**
 * follow svg
 */
import starNone from '../../assets/starNone.svg';
import starDone from '../../assets/starDone.svg';

import api from '../../constants/api'


import './Profile.css';

const PostItem = (props) => {
    console.log('props are ', props)
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [upVoted, setupVote] = useState(()=>{
      return props.props.upVoted;
    });
    const [upNumber, setupNumber] = useState(()=>{
      return props.props.upVotes;
    });
    const [follow, setFollow] = useState(()=>{
      return props.props.follow;
    });
    const [followNum, setFollowNum]= useState(()=>{
      return props.props.followers
    })

    console.log('this is the user in useState ', props.user)
    const next = () => {
      if (animating) return;
      const nextIndex = activeIndex === props.props.media.length - 1 ? 0 : activeIndex + 1;
      setActiveIndex(nextIndex);
    }
  
   
  
    const slides = props.props.media.map((item) => {
        let extension = item.split('.');
        if(extension[1]==="mp4"){

            return(

           <div style={{zIndex:'1000000'}}>
           <ReactPlayer
          className='react-player'
          url={item}
          width='100%'
          height='100%'
          controls={true}
          
        />
        </div>
            )

        }else {
      return (
        <div>
          <img src={item} />
          </div>
      );
    }});
  
    return (
        
        <Card>
            <CardBody>
            <CardTitle tag="h5">
                                            {
                                            props.props.header.length>20?props.props.header.substring(0,20)+'...':props.props.header
                                        }</CardTitle>
                                        <CardSubtitle tag="h6" className="mb-2 text-muted">@{
                                            props.props.postedBy
                                        }</CardSubtitle>
            </CardBody>
            <CardBody>
      
            <Carousel itemsToShow={1}>
          {
              props.props.media.map((element)=>{
                console.log('media is ', props.props.media);
                  if(element.split('.')[1]==="mp4"){
                      return(
                          <div>
                               <ReactPlayer
                           className='react-player'
                           url={element}
                           width='100%'
                           height='100%'
                           controls={true}
                         />
                          </div>
                      )
                  }
                  return(<div>
                      <img src={element}></img>
                  </div>)
              })
          }
      </Carousel>
      </CardBody>
      <CardBody>
      <CardText>{
          props.props.body.length>25?props.props.body.substring(0,25)+ "...":props.props.body
                                            
                                        }</CardText>
      </CardBody>
      <CardBody>
      <Row>
        <Col justify={{md: 'justify', xl: 'around'}} >
        <div style={{disply:'inline-flex'}}>
        <img className="change-cursor" src={upVoted?upDone:upNone} onClick={async ()=>{
          let url= api + '/api/up?id='+props.props._id.toString()
          let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let responseRaw = await fetch(url, options);
        let response = await responseRaw.json();
        console.log('response is ', response)
          if(upVoted){
            setupVote(false)
            setupNumber(upNumber-1)
          }
          else {
            setupVote(true)
            setupNumber(upNumber+1)
            }
        }}></img>
        <p>{upNumber}</p>
        </div>
        </Col>
        <Col>
        <img className="change-cursor" src={follow?starDone:starNone} onClick={async ()=>{

if(follow){
  setFollow(false)
  setFollowNum(followNum-1)
}
else {
  setFollow(true)
  setFollowNum(followNum+1)
  }

let url= api + '/api/follow?id='+props.props._id.toString()
let options = {
  method: "POST",
  headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      token: localStorage.getItem("token").toString()
  }
};
let responseRaw = await fetch(url, options);
let response = await responseRaw.json();
console.log('response is ', response)

        }}></img>
        <p>{followNum}</p>
        </Col>
        </Row>
      </CardBody>
      </Card>
    );
  }

  export default PostItem;