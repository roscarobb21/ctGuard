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

import { Spinner } from 'reactstrap';
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

import 'react-multi-carousel/lib/styles.css';
import './HomeLog.css'

 


class HomeLogged extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentlyPosts:null,
            following:null,
            usrUpVoted:null,
            usrFollow:null,
            feed:null,
            feedPosts:null,
            dropdownOpen:false,
            dropdownViewOpen:false,
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
                this.fetchFeed();
        }
    }
async componentDidMount(){
    window.addEventListener('scroll', this.handleScroll);
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
    this.setState({feedPosts:tempPosts})
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
    this.setState({feed:response.user.feed, feedPosts:Feedresponse.posts, usrUpVoted:likedResponse.upVoted, usrFollow:usrFollowResponse.following})
    }else {


    }

  
    }
/**
 * 
 * @param {recently upvoted posts (fetched)} posts 
 * Generates cards for recently upvoted posts
 */
    generateRecentlyItems = (posts) => { // fetch my latest posts
        if (this.state.recentlyPosts === null || this.state.recentlyPosts.length === 0) {
            return (
                <div>
                    <p>You don't have any posts yet</p>
                </div>
            )
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
                               <Card>
                                   <CardBody>
                                    <CardTitle>
                                        {post.header.lenth>20?post.header.substring(0, 20)+"...":post.header}
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
        if (this.state.following === null || this.state.following.length === 0) {
            return (
                <div>
                    <p>You don't have any posts yet</p>
                </div>
            )
        }
        return this.state.following.map((post)=>{
            console.log('media is ', post.media)
            let mediaMap= (media)=>{
                return media.map((item)=>{
                    let ext = item.split('.')
                    if(ext[1] === "mp4"){
                        return(
                            <div style={{zIndex:'1000000', padding:'40px', width:'500px', height:'300px'}}>
                            <ReactPlayer
                           className='react-player'
                           url={item}
                           width='100%'
                           height='100%'
                           controls={true}
                         />
                         </div>
                        )
                    }
                    return(
                    <div><img src={item}></img></div>
                    )
                })
            }
                /**
                 * TapeView
                 */
            return(<div>
            <Card style={{marginTop:'2vh'}}>
                <CardBody>
                <CardTitle>{post.header.length>20?post.header.substring(0, 20)+"...":post.header}</CardTitle>
                <CardSubtitle>@{post.postedBy}</CardSubtitle>
                <CardBody>
                    {()=>{
                        if(post.media.length===0){
                            return(<div >This post doesn't have media :(</div>)
                        }else {
                            return(
                                <Carousel itemsToShow={this.reponsive} ssr={true} swipeable={false} 
                                draggable={false} 
                                showDots={true}>
                               {mediaMap(post.media)}
                                              </Carousel>
                            )
                        }
                    }}
               
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
                      let responseRaw = await fetch(url, options);
                      let response = await responseRaw.json();
                      console.log('ON LIKE CLICK ', response)
                            this.setState({usrUpVoted:response.upVoted})
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
                      let responseRaw = await fetch(url, options);
                      let response = await responseRaw.json();
                      console.log('ON Follow CLICK ', response)
                            this.setState({usrFollow:response.followNew})
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
generateFeedCards=  (props)=>{
    if (this.state.feedPosts === null || this.state.feedPosts.length === 0) {
        return (
            <div>
                <p>You don't have any posts yet</p>
            </div>
        )
    }
    return this.state.feedPosts.map((post)=>{
        console.log('media is ', post.media)
        let mediaMap= (media)=>{
            return media.map((item)=>{
                let ext = item.split('.')
                if(ext[1] === "mp4"){
                    return(
                        <div style={{zIndex:'1000000', padding:'40px', width:'500px', height:'300px'}}>
                        <ReactPlayer
                       className='react-player'
                       url={item}
                       width='100%'
                       height='100%'
                       controls={true}
                       
                     />
                     </div>
                    )
                }
                return(
                <div><img src={item}></img></div>
                )
            })
        }
        return(<div>
        <Card style={{marginTop:'2vh'}}>
            <CardBody>
            <CardTitle onClick={()=>{
                window.location.assign('/post/'+post._id.toString())
               }}><p className="change-cursor">{post.header}</p></CardTitle>
            <CardSubtitle><Link to={'/user/'+post.postedBy}>@{post.postedBy}</Link></CardSubtitle>
            <CardBody>

                {post.media.length===0?"This post has no media attached":()=>{
                     return(
                        <Carousel  ssr={true} swipeable={false} 
                        draggable={false} 
                        showDots={true}>
                        {mediaMap(post.media)}
                        
                        </Carousel>
                    )
                }}
              
              
           
            </CardBody>
            <CardBody>{post.body.length>50?post.body.substring(0,50)+"...":post.body}</CardBody>
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
                  let responseRaw = await fetch(url, options);
                  let response = await responseRaw.json();
                  console.log('ON LIKE CLICK ', response)
                        this.setState({usrUpVoted:response.upVoted})
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
                  let responseRaw = await fetch(url, options);
                  let response = await responseRaw.json();
                  console.log('ON Follow CLICK ', response)
                        this.setState({usrFollow:response.followNew})
                }}></img>
                </Col>
                </Row>
            </CardFooter>
        </Card>
        </div>)
    })
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
                    <Col></Col>
                    <Col md="12" lg="4">
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

    <Dropdown isOpen={this.state.dropdownViewOpen} toggle={this.toggleViewDrop} style={{marginLeft:'2vw'}}>
      <DropdownToggle caret>
          View
        </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.setState({feedListView:true})
        } }>Tape like</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({feedListView:false})
        }}>Grid</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    </div>
        {(this.state.feedPosts && this.state.feed)?<this.generateFeedCards/>:this.generateFollowingItems(this.state.followingPosts)}
        
        
     
                        </div>
                        </Col>

                        <Col></Col>
                </Row>
            </div>
        )
    }
}


export default HomeLogged;
