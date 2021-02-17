import React, {useState} from 'react';
import {Container, Row, Col} from 'reactstrap';
import {Card,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
CardFooter} from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Navbar from '../NavBar/Navbar';
import Carousel from 'react-elastic-carousel';
import ReactPlayer from 'react-player';
import api from '../../constants/api';
import {Link} from 'react-router-dom';
import { ListGroup, ListGroupItem, Label , Button, UncontrolledCollapse} from 'reactstrap';
import { Spinner } from 'reactstrap';

/**
 * upvote svg
 */
import upNone from '../../assets/upNone.svg';
import upDone from '../../assets/upDone.svg';
import pop from '../../assets/pop.mp3';
import unPop from '../../assets/unPop.mp3';
/**
 * follow svg
 */
import starNone from '../../assets/starNone.svg';
import starDone from '../../assets/starDone.svg';

/**
 * Collapse expand svg
 */

 import collapseImg from '../../assets/collapse.svg';
 import expandImg from '../../assets/expand.svg';



import {Badge} from 'reactstrap';



import 'react-multi-carousel/lib/styles.css';
import './HomeLog.css'

const io = require("socket.io-client");
 
/**
 * TODO:
 * Notification table for comments or resolved issues
 * 
 */

class HomeLogged extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uid:null,
            recentlyPosts:null,
            following:null,
            usrUpVoted:null,
            usrFollow:null,
            feed:null,
            feedPosts:null,
            dropdownOpen:false,
            dropdownViewOpen:false,
            showSpinner:false,
            notificationsFeed:null,
            toggleNotificationsCollapse:true,
            update:false,
        }
        this.breakPoints = [
            { width: 1, itemsToShow: 1 },
            { width: 550, itemsToShow: 2, itemsToScroll: 2, pagination: false },
            { width: 850, itemsToShow: 3 },
            { width: 1150, itemsToShow: 4, itemsToScroll: 2 },
            { width: 1450, itemsToShow: 5 },
            { width: 1750, itemsToShow: 6 },
          ]
    }
    socket = io(api)
    toggleDrop=()=>{
        this.setState({dropdownOpen:!this.state.dropdownOpen})
    }
    toggleViewDrop=()=>{
        this.setState({dropdownViewOpen:!this.state.dropdownViewOpen})
    }
    responsive = {
        superLargeDesktop: { // the naming can be any, depends on you.
            breakpoint: {
                max: 4000,
                min: 3000
            },
            items: 5
        },
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024
            },
            items: 3
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464
            },
            items: 2
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0
            },
            items: 1
        }
    };
    responsivePost = {
        superLargeDesktop: { // the naming can be any, depends on you.
            breakpoint: {
                max: 4000,
                min: 3000
            },
            items: 1
        },
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024
            },
            items: 1
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464
            },
            items: 1
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0
            },
            items: 1
        }
    };
    handleScroll=()=>{
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = Math.round(windowHeight + window.pageYOffset);

        if (windowBottom >= docHeight) {
            this.setState({showSpinner:true})
                this.fetchFeed();
        }
    }
async componentDidMount(){
    window.addEventListener('scroll', this.handleScroll);
    this.socket.on('comment', (pid)=>{
        //increment number on pid from notificationsFeed on fetch
        let newNot =  this.state.notificationsFeed;
        newNot.forEach(element => {
            if(element.postId===pid){
                ++element.number;
            }
        });
        this.setState({notificationsFeed:newNot})
     })

    let recentlyUrl = api + '/api/recently';
    let followUrl = api + '/api/following';
    let likedUrl= api+'/api/up';
    let followArrayUrl= api+'/api/follow';
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    };
    let postOptions={
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    }
    let responseRaw = await fetch(recentlyUrl, options);
    let response = await responseRaw.json();
    let followResponseRaw = await fetch(followUrl, options)
    let followResponse = await followResponseRaw.json();
    
    let likedResponseRaw = await fetch(likedUrl, postOptions);
    let likedResponse = await likedResponseRaw.json();

    let usrFollowRaw = await fetch(followArrayUrl, postOptions);
    let usrFollowResponse = await usrFollowRaw.json();

    this.setState({recentlyPosts:response.posts, following:followResponse.posts, usrUpVoted:likedResponse.upVoted, usrFollow:usrFollowResponse.following})

}
 fetchFeed= async()=>{
    let url = api+ '/api/feed';
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    };
    let responseRaw = await fetch(url, options);
    let response = await responseRaw.json();
    let tempPosts = []
    tempPosts = tempPosts.concat(this.state.feedPosts)
    tempPosts = tempPosts.concat(response.posts)
    this.setState({feedPosts:tempPosts, showSpinner:false})
}



   async componentWillMount(){
       let url= api+'/api'
       let likedUrl= api+'/api/up';
       let followArrayUrl= api+'/api/follow';
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }

    };
    let postOptions={
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    }
    let responseRaw= await fetch(url, options);
    let response = await responseRaw.json();
    console.log('user ', response)
    if(response.user.feed){
        let Feedurl = api+ '/api/feed';
    let Feedoptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    };
    let FeedresponseRaw = await fetch(Feedurl, Feedoptions);
    let Feedresponse = await FeedresponseRaw.json();
    let likedResponseRaw = await fetch(likedUrl, postOptions);
    let likedResponse = await likedResponseRaw.json();

    let usrFollowRaw = await fetch(followArrayUrl, postOptions);
    let usrFollowResponse = await usrFollowRaw.json();
    this.socket.emit('join_push_notifications', response.user.id.toString())
    this.setState({uid:response.user.id.toString(),feed:response.user.feed, feedPosts:Feedresponse.posts, usrUpVoted:likedResponse.upVoted, usrFollow:usrFollowResponse.following})
    }else {


    }

  
    }
/**
 * 
 * @param {recently upvoted posts (fetched)} posts 
 * Generates cards for recently upvoted posts
 */
    generateRecentlyItems = (posts) => { // fetch my latest posts
        if (this.state.recentlyPosts === null ) {
            return (
                <div>
                   <Spinner/>
                </div>
            )
        }else if(this.state.recentlyPosts.length === 0){
            return(<div><p>You don't have any recently up voted posts</p></div>)
        }
        return this.state.recentlyPosts.map((post) => {
            //let liked= this.state.upVoted.includes(post._id.toString())?true:false;
           // let follow= this.state.follow.includes(post._id.toString())?true:false;
            //post.upVoted=liked
           // post.follow= follow
            return (
                <div>
                    <div className="my-post-item">
                        <Row>
                            <Col md="2"></Col>
                            <Col md="8">
                               <Card className="change-cursor" onClick={()=>{
                                    window.location.assign('/post/'+post._id.toString())
                               }}>
                                   <CardBody>
                                    <CardTitle>
                                    {post.header.length>20?post.header.substring(0, 20)+"...":post.header}
                                    </CardTitle>
                                   </CardBody>
                               </Card>
                            </Col>
                            <Col md="2"></Col>
                        </Row>
                    </div>
                </div>
            );
        })
    }
/**
 * Following cards
 */
    generateFollowingItems=()=>{
        if (this.state.following === null ) {
            return (
                <div>
                    <Spinner/>
                </div>
            )
        }else if (this.state.following.length === 0){
            return(<div>
                <p>You don't follow any posts yet</p>
            </div>)
        }
        return this.state.following.map((post)=>{

      
                /**
                 * TapeView
                 */
            return(<div>
            <Card style={{marginTop:'2vh'}}>
                <CardBody>
                <CardTitle>{post.header.length>20?post.header.substring(0, 20)+"...":post.header}</CardTitle>
                <CardSubtitle>@{post.postedBy}</CardSubtitle>
                <CardBody>
                   {this.showCarousel(post.media)}
                </CardBody>
                <CardBody>{post.body.length>30?post.body.substring(0, 30)+"...":post.body}</CardBody>
                </CardBody>
                
                <CardFooter>
                    <Row>
                        <Col>
                    <img className="change-cursor" src={this.state.usrUpVoted.includes(post._id.toString())?upDone:upNone} onClick={async ()=>{
                        let url= api + '/api/up?id='+post._id.toString()
                        let options = {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                              "Cache-Control": "no-cache, no-store, must-revalidate",
                              Pragma: "no-cache",
                              token: localStorage.getItem("token").toString()
                          }
                      };
                       fetch(url, options);
                       if(this.state.usrUpVoted.includes(post._id.toString())){
                        let newUpvotes = this.state.usrUpVoted;
                        newUpvotes.splice(newUpvotes.indexOf(post._id.toString), 1);
                      this.setState({usrUpVoted:newUpvotes})
                    }else {
                        let newUpvotes = this.state.usrUpVoted;
                        newUpvotes.push(post._id.toString())
                        this.setState({usrUpVoted:newUpvotes})
                    }  
                      
                    }}></img>
                    </Col><Col>
                     <img className="change-cursor" src={this.state.usrFollow.includes(post._id.toString())?starDone:starNone} onClick={async ()=>{
                        let url= api + '/api/follow?id='+post._id.toString()
                        let options = {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                              "Cache-Control": "no-cache, no-store, must-revalidate",
                              Pragma: "no-cache",
                              token: localStorage.getItem("token").toString()
                          }
                      };
                     fetch(url, options);
                     if(this.state.usrFollow.includes(post._id.toString())){
                        //remove from list 
                        let newFollow= this.state.usrFollow;
                        newFollow.splice(newFollow.indexOf(post._id.toString()), 1)
                        this.setState({usrFollow:newFollow})
                    }else {
                        //add to list 
                        let newFollow= this.state.usrFollow;
                        newFollow.push(post._id.toString())
                        this.setState({usrFollow:newFollow})
                    } 
                     
                    }}></img>
                    </Col>
                    </Row>
                </CardFooter>
            </Card>
            </div>)
            
        })

    }
/**
 * Generate feed cards 
 */
/**
 * Check if post has media
 * if has: show carousel, map media
 * if not: show message "this post has no media attached"
 * 
 */

showCarousel=(media)=>{
    if(media.length>0){
        return(<div className="card-media-carousel"><Carousel itemsToShow={1}
        showArrows={media.length===1?false:true}
        disableArrowsOnEnd={false}
        enableMouseSwipe={false}
        
        >
               {
              media.map((element)=>{
                  if(element.split('.')[1]==="mp4"){
                      return(
                          <div style={{width:'100%', height:'100%',padding:'10px'}}>
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
        </Carousel></div>)
    }else {
        return(<div>This post has no media</div>)
    }
}

generateFeedCards=  (props)=>{
    if (this.state.feedPosts === null || this.state.feedPosts.length === 0) {
        return (
            <div>
                <p>Server error</p>
            </div>
        )
    }
  
    return this.state.feedPosts.map((post)=>{
        return(<div className="card-size">
        <Card  style={{marginTop:'2vh', backgroundColor:'#eeeeee'}}>
            <CardBody>
            <CardTitle onClick={()=>{
                window.location.assign('/post/'+post._id.toString())
               }}><p className="change-cursor card-text-header1 ">{post.header.length>30?post.header.substring(0, 30)+"...":post.header}</p></CardTitle>
            <CardSubtitle><Link to={'/user/'+post.postedBy}>@{post.postedBy}</Link></CardSubtitle>
            <CardBody >
              {this.showCarousel(post.media)}
            </CardBody>
            <CardBody className="float-left text-justify">{post.body.length>150?post.body.substring(0,150)+"...":post.body}</CardBody>
            </CardBody>
            
            <CardFooter style={{backgroundColor:'#eeeeee'}}>
                <Row>
                    <Col>
                <img className="change-cursor" src={post.userUpVoted?upDone:upNone} onClick={async ()=>{
                    post.userUpVoted= !post.userUpVoted
                    let url= api + '/api/up?id='+post._id.toString()
                    let options = {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          "Cache-Control": "no-cache, no-store, must-revalidate",
                          Pragma: "no-cache",
                          token: localStorage.getItem("token").toString()
                      }
                  };
                   fetch(url, options)
                 
                    if(!post.userUpVoted){
                        //exclude
                        let audio = new Audio(unPop)
                        audio.play()
                        post.upVotes--;
                    }else {
                        //include
                        let audio = new Audio(pop)
                        audio.play()
                        post.upVotes++;
                    }
                     this.setState({update:!this.state.update})
                }}></img> 
                &nbsp;
                <span>{post.upVotes}</span>
                </Col><Col>
                 <img className="change-cursor" src={this.state.usrFollow.includes(post._id.toString())?starDone:starNone} onClick={async ()=>{
                    let url= api + '/api/follow?id='+post._id.toString()
                    let options = {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          "Cache-Control": "no-cache, no-store, must-revalidate",
                          Pragma: "no-cache",
                          token: localStorage.getItem("token").toString()
                      }
                  };
                 fetch(url, options);
                if(this.state.usrFollow.includes(post._id.toString())){
                    //remove from list 
                    let newPosts = this.state.feedPosts;
                    newPosts.forEach(element => {
                      if(element._id.toString()===post._id.toString()){
                          element.followers--;
                      }
                  });
                    let newFollow= this.state.usrFollow;
                    newFollow.splice(newFollow.indexOf(post._id.toString()), 1)
                    this.setState({usrFollow:newFollow, feedPosts:newPosts})
                }else {
                    //add to list 
                    let newPosts = this.state.feedPosts;
                    newPosts.forEach(element => {
                      if(element._id.toString()===post._id.toString()){
                          element.followers++;
                      }
                  });
                    let newFollow= this.state.usrFollow;
                    newFollow.push(post._id.toString())
                    this.setState({usrFollow:newFollow, feedPosts:newPosts})
                } 
                }}></img>
                &nbsp;
                <span>{post.followers}</span>
                </Col>
                </Row>
            </CardFooter>
        </Card>
        </div>)
    })
}

clearNotificationsFeedCard=(id)=>{
    let url= api + '/api/clearCommentQueue?id='+id;
    let options = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString()
      }
  };
  fetch(url, options);
}


generateNotificationsFeed=()=>{
    let feed;
    if(this.state.notificationsFeed===null){
        feed = this.fetchNotificationsFeed();
    }else {
        if(this.state.notificationsFeed!==null && this.state.notificationsFeed !== undefined){
            return(this.state.notificationsFeed.map(element=>{
               
                return(<ListGroupItem style={{marginTop:'1vh', borderRadius:'5%'}} className="float-left" className="change-cursor" onClick={()=>{
                    this.clearNotificationsFeedCard(element.postId)
                    window.location.assign('/post/'+element.postId)
                }}>New comments on: {element.postHeader.length>20?element.postHeader.substring(0, 20)+"...":element.postHeader}&nbsp;<Badge style={{color:"#00adb5", backgroundColor:"#ffffff"}}>{element.number}</Badge></ListGroupItem>)
            }
            ))
        }
    }

}
fetchNotificationsFeed=()=>{
    let url= api + '/api/notifications';
    let options = {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString()
      }
  };
  fetch(url, options).then(response=>response.json()).then(response=>{
      this.setState({notificationsFeed:response.notificationsComments})
  })
}
toggleNotifications=()=>{
    this.setState({toggleNotificationsCollapse:!this.state.toggleNotificationsCollapse})
}
    render() {
        if(this.state.recentlyPosts===[] && this.state.recentlyPosts === null){
            return null
        }
        return (
            <div>
                <Row>
                    <Col>
                        <Navbar/>

                    </Col>
                </Row>
                <Row >
                    <Col>
                    <div>
                    <p className="text-header2 float-left">Recently upvoted posts</p>
                        <Carousel itemsToShow={3}  breakPoints={this.breakPoints}
  onResize={currentBreakPoint => console.log(currentBreakPoint)}>
                           {this.generateRecentlyItems(this.state.recentlyPosts)}
                        </Carousel>
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop:'2vh'}}>
                <Col md={{size:0}} lg={{size:2, order:1}}> </Col>
                    <Col  xs={{size:12, order:2}} sm={{size:12, order:2}} md={{size:12, order:2}} lg={{size:5, order:2}}>
                    <div>
                        <div style={{display:'flex'}}>
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDrop} >
      <DropdownToggle caret>
        {this.state.feed!==null?this.state.feed?"Feed":"Following":"unknowk"}
        </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.setState({feed:true})
        } }>Feed</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({feed:false})
        }}>Following</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    </div>
        {(this.state.feedPosts && this.state.feed)?this.generateFeedCards():this.generateFollowingItems(this.state.followingPosts)}
                        </div>
                        </Col>

                        <Col className="" xs={{size:12, order:1 ,}}  sm={{size:12, order:1}} md={{size:12, order:1}} lg={{size:3, order:3}}>
                            <div style={{width:'100%'}}>
                            <div>
                        <Label className="text-header2 float-left">Notifications</Label>
                       <img id="toggleImg" className="change-cursor dropdown-img float-right" src={this.state.toggleNotificationsCollapse?expandImg:collapseImg} onClick={this.toggleNotifications}></img>
                        </div>
                        <UncontrolledCollapse toggler="toggleImg" style={{width:'100%'}}>
                        <div>
                       
                            <div className="" style={{width:'100%', height:'200px', overflowY:'scroll'}}>
                        <div  style={{width:'100%'}}>
                        <ListGroup>
                            {this.generateNotificationsFeed()}
                        </ListGroup>
                        </div>
                        </div>
                        </div>

                        </UncontrolledCollapse>
                        </div>
                         </Col>  
                </Row>
                <Row style={{height:'2vh'}}>
                    <Col>
                    {this.state.showSpinner?<Spinner style={{marginTop:'2vh', marginBotton:'2vh'}}/>:null}
                    </Col>
                </Row>
            </div>
        )
    }
}


export default HomeLogged;
