import React, {useState} from 'react';
import {Container, Row, Col} from 'reactstrap';
import {Card,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
CardFooter} from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ButtonDropdown, Spinner } from 'reactstrap';
import Navbar from '../NavBar/Navbar';
import Carousel from 'react-elastic-carousel';
import ReactPlayer from 'react-player';
import api from '../../constants/api';
import { ListGroup, ListGroupItem, Label , Button, UncontrolledCollapse} from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-medium-image-zoom/dist/styles.css';
import Collapse from "@kunukn/react-collapse";
import refresh from '../../assets/refresh.png';

import { InView } from 'react-intersection-observer';

import followSound from '../../assets/followSound.wav';
import Notification from '../../assets/notification.wav';

import ScrollToTop from "react-scroll-to-top";
import {Badge} from 'reactstrap';
import Sticky from 'react-sticky-el';
import PostItem from '../PostItem/PostItem';
import PostItemScheleton from '../PostItem/PostItemScheleton';
import 'react-multi-carousel/lib/styles.css';
import './HomeLog.css'
import { List } from '@material-ui/core';

const io = require("socket.io-client");
/**
 * TODO:
 * Notification table for comments or resolved issues
 * 
 */

/**
 * TODO GET NOTIFICATION WRAPPER FIXED ON SCREEN IF WIDTH > 991 && not in viewport
 */

 

class HomeLogged extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollHeightCheck:0,
            uid:null,
            recentlyPosts:null,
            following:null,
            usrUpVoted:null,
            usrFollow:null,
            feed:null,
            feedPosts:null,
            feedLoading:true,
            followLoading:true,
            dropdownOpen:false,
            dropdownViewOpen:false,
            showSpinner:false,
            notificationsFeed:null,
            toggleNotificationsCollapse:true,
            update:false,
            notificationsIsOpen:false,
            notificationsIsVisible:true,
            isNotificationsFixed:false,
            dropDownText:["Feed", "Following"],
            dropDownTextIndex:0,
            notificationsFeedElements:null,
            updated:false,
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
    socket = io(api.backaddr)
    NotificationsComponent = () => {
        const onInit = ({ state, style, node }) => {
          /*
             node: HTMLElement = the DOM node of the component.
          */
        };
        return (
            
            
          <div >
              <Row>
                  <Col>
              <span className="text-header2 notifications-button" title={this.state.notificationsIsOpen?"Click to collapse":"Click to expand"} onClick={()=>this.setState({notificationsIsOpen:!this.state.notificationsIsOpen})}>Notifications&nbsp;</span>
              </Col>
            </Row> 
            <Collapse transition="400ms" onInit={onInit} isOpen={this.state.notificationsIsOpen}>
                <br></br>
                    <small className="float-left" style={{color:'#00adb5'}}>Post notifications: </small>
                    <hr></hr>
                <div className="notifications-list" >
                    <ListGroup className="" style={{scrollbarWidth:'0px'}}>
                            {this.generateNotificationsFeed()}
                        </ListGroup>
                        </div>
                        <br></br>
                        <small className="float-left" style={{color:'#00adb5'}}>Comments notifications:</small>
                        <hr></hr>
                        <div className="notifications-list" style={{minHeight:'200px', maxHeight:'300px'}}>
                      
                        <ListGroup className="" style={{scrollbarWidth:'0px'}}>
                            {this.generateCommentNotificationFeed()}
                        </ListGroup>
                        </div>
            </Collapse>
          </div>
        );
      };
      generateNotificationsFeed=()=>{
            if(this.state.notificationsFeedElements === null){
                return(<ListGroupItem>You don't have any notifications</ListGroupItem>)
            }
            if(this.state.notificationsFeedElements.length === 0){
                return(<ListGroupItem>You don't have any notifications</ListGroupItem>)
            }
            return this.state.notificationsFeedElements.map((element, i)=>{
                let mycls = "float-left "
                mycls+= element.new?"":"text-black-always"
                return(<ListGroupItem className="change-cursor" style={{marginTop:i==0?'0px':'20px', backgroundColor:element.new?"rgba(0,173,181, 0.3)":'white'}} onClick={()=>{
                    let url= api.backaddr + '/api/clearAuthResponseNotification'
                    let options = {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          "Cache-Control": "no-cache, no-store, must-revalidate",
                          Pragma: "no-cache",
                          token: localStorage.getItem("token").toString()
                      } ,
                       body: JSON.stringify({
                        nid: element._id.toString(),
                      }),
                  };
                  fetch(url, options)
                  window.location.assign('/post/'+element.url);
                }}><span className={mycls} style={{textAlign:'left'}}>{element.title.length>50?element.title.substring(0, 50)+"...":element.title}&nbsp;<Badge color={element.new?'primary':'secondary'}>{element.number}</Badge></span> </ListGroupItem>)
            })
          }
          generateCommentNotificationFeed=()=>{
              if(this.state.notificationsFeed === null){
                  return(<Spinner/>)
              }
             
              return(
                <ListGroup>
                    {this.commentNotificationElements()}
                </ListGroup>
              )
          }

          commentNotificationElements= ()=>{
            if(this.state.notificationsFeed.length === 0){
                return(<ListGroupItem>You don't have any comment notifications</ListGroupItem>)
            }
            return this.state.notificationsFeed.map(element=>{
                return(<ListGroupItem className="change-cursor" 
                style={{backgroundColor:element.number>0?"rgba(0,173,181, 0.3)":'white'}}
                onClick={()=>{
                    let url = api.backaddr + api.authUser + '/clearCommentQueue?id='+element.postId;
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
                    window.location.assign('/post/'+element.postId)
                }}
                >
                   <span className="float-left" style={{textAlign:'left'}}>New comments for: {element.postHeader.length>50?element.postHeader.substring(0, 50)+"...":element.postHeader} <Badge color={element.number===0?'secondary':'primary'}>{element.number}</Badge> </span></ListGroupItem>)
            })

          }




          fetchNotificationsFeed=()=>{
            let url= api.backaddr + '/api/notifications';
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
              
              this.setState({notificationsFeed:response.notificationsComments, notificationsFeedElements: response.notifications})
          })
        }


      clearNotificationsFeedCard=(id)=>{
        let url= api.backaddr + '/api/clearCommentQueue?id='+id;
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
    
    
   
    
    
    toggleNotifications=()=>{
        this.setState({toggleNotificationsCollapse:!this.state.toggleNotificationsCollapse})
    }
    
  
    //first fetch the recently liked posts
async componentDidMount(){
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.updateDimensions);
    //  this.socket.emit('join_push_notifications', response.user.id.toString())
    this.socket.on('following_post_notification', (info)=>{
        let notifications = this.state.notificationsFeedElements;
        let audio = new Audio(Notification);
        audio.play();
       this.fetchNotificationsFeed();
    })
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

    let recentlyUrl = api.backaddr + '/api/recently';
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    };
    let responseRaw = await fetch(recentlyUrl, options);
    let response = await responseRaw.json();
    this.setState({recentlyPosts:response.posts })

}



    toggleDrop=()=>{
        this.setState({dropdownOpen:!this.state.dropdownOpen})
    }
    toggleViewDrop=()=>{
        this.setState({dropdownViewOpen:!this.state.dropdownViewOpen})
    }
 
   
    updateDimensions = () => {
        console.log('width is q: ', window.innerWidth)
        this.setState({ width: window.innerWidth});
      };

    componentWillUnmount(){
        window.removeEventListener('resize', this.updateDimensions);
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
                   <RecentlyScheleton/>
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
                    <div className="recently-size">
                               <Card className="recently-card-box background-component " style={{alignItems:'center', alignContent:'center', justifyContent:'center', padding:'10px'}} onClick={()=>{
                                    window.location.assign('/post/'+post._id.toString())
                               }}>
                                   <CardBody className="" style={{padding:'10px'}}>
                                    <CardTitle className="justify-content-center">
                                   <p className="recently-text"> {post.header.length>20?post.header.substring(0, 20)+"...":post.header}</p>
                                    </CardTitle>
                                   </CardBody>
                               </Card>
                    </div>
               
            );
        })
    }



    async componentWillMount(){
        //user info and notifications subscribe
    let url= api.backaddr+'/api'
    let options = {
             method: "GET",
             headers: {
                 "Content-Type": "application/json",
                 "Cache-Control": "no-cache, no-store, must-revalidate",
                 Pragma: "no-cache",
                 token: localStorage.getItem("token").toString()
             }
         };
   
     let responseRaw= await fetch(url, options);
     let response = await responseRaw.json();
     this.fetchNotificationsFeed();
     this.socket.emit('join_push_notifications', response.user.id.toString())
 


     if(response.user.feed){
     this.setState({uid:response.user.id.toString(),feed:response.user.feed, dropDownTextIndex:0})
     this.fetchFeed()
     }else {
     this.setState({uid:response.user.id.toString(),feed:response.user.feed, dropDownTextIndex:1})
     this.fetchFollowingPosts();
     }
     }




/**
 * Following cards
 */
    generateFollowingItems=()=>{
        if (this.state.following === null) {
            return (
                <div>
                   <GenerateSkeletonsCard/>
                </div>
            )
        }
        if (this.state.followLoading) {
            return (
                <div>
                   <GenerateSkeletonsCard/>
                </div>
            )
        }
      
        if (this.state.following.length === 0 && !this.state.followLoading){
            return(<div style={{marginTop:'30px'}}>
                <p>You don't follow any posts yet</p>
            </div>)
        }
        
        return this.state.following.map((post)=>{
            if(post === null){
                return;
            }
            return(<div>
            <PostItem post={post}/>
            </div>)
            
        })

    }



generateFeedCards=  (props)=>{
    if (this.state.feedLoading) {
        return (
            <div>
               <GenerateSkeletonsCard/>
            </div>
        )
    }

    if (this.state.feedPosts === null) {
        return (
            <div>
               <GenerateSkeletonsCard/>
            </div>
        )
    }
    return this.state.feedPosts.map((post, i)=>{
        if(post===null){
            return;
        }
        if((i+1) === this.state.feedPosts.length){
            console.log("478 LAST IS : ", post)
                return(
                    <div>
                            <PostItem post={post}/>
                    <InView>
                    {({ inView, ref, entry }) => {
                        if(inView && !this.state.updated){
                            this.setState({showSpinner:true, updated:true})
                            console.log("478 REFETCH")
                            this.fetchFeed()
                        }
                        
                        return(
                <div className="card-size latest-card" ref={ref}>
                         <GenerateSkeletonsCard/>
                </div>)
        }}
                        </InView>
                        
                        </div>
                )
        }

        return(<div className="card-size">
            <PostItem post={post}/>
        </div>)
    })



}


fetchFeed= async()=>{
    //this.setState({feedLoading:true})
   let url = api.backaddr+ '/api/feed';
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
   tempPosts = this.state.feedPosts!==null?tempPosts.concat(this.state.feedPosts):[]
   tempPosts = tempPosts.concat(response.posts)

   console.log("🚀 ~ file: HomeLogged.jsx ~ line 478 ~ HomeLogged ~ fetchFeed=async ~ tempPosts", tempPosts)
   this.setState({feedPosts:tempPosts, showSpinner:false, feedLoading:false, updated:false})
   
}

fetchFollowingPosts = async ()=>{
   this.setState({followLoading:true})
   let url = api.backaddr+ '/api/following';
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
   if(response.ok === 1 && response.posts.length === 0){
       this.setState({followLoading:false})
   }
   this.setState({following:response.posts, showSpinner:false, followLoading:false})
}




refreshFeed = ()=>{
    if(this.state.feed){
        this.setState({feedLoading:true, feedPosts:[]})
        this.fetchFeed();
    }else{
        this.setState({followLoading:true, following:[]})
        this.fetchFollowingPosts()
    }
}

    render() {
       
        return (
            <div className="background" style={{minHeight:'110vh'}}>
                <ScrollToTop smooth color="#08d9d6" />
                <Row>
                    <Col>
                        <Navbar/>
                    </Col>
                </Row>
                <Row style={{marginTop:'1vh'}}>
                    <Col>
                        <Container>
                    <div>
                    <p className="text-header2 float-left text-color" style={{}} >Recently upvoted posts</p>
                        <Carousel enableTilt={true} enableAutoPlay autoPlaySpeed={30000}  itemsToShow={3} itemsToScroll={1} breakPoints={this.breakPoints}  disableArrowsOnEnd={false}
  onResize={currentBreakPoint => console.log(currentBreakPoint)}>
                           {this.generateRecentlyItems(this.state.recentlyPosts)}
                        </Carousel>
                        </div>
                        </Container>
                    </Col>
                </Row>
                <Container>
                    <Row>
                        <Col>
                        <hr></hr></Col>
                        </Row>
                </Container>
                <Row className="background" style={{marginTop:'2vh'}}>
                <Col md={{size:0}} lg={{size:2, order:1}}> </Col>
                    <Col  xs={{size:12, order:2}} sm={{size:12, order:2}} md={{size:12, order:2}} lg={{size:5, order:2}}>
                    <div>
                       <Row >
                           <Col className="">
                    <ButtonDropdown outline color="primary" isOpen={this.state.dropdownOpen} toggle={this.toggleDrop} className="float-left">
                    <DropdownToggle caret outline color="primary">
                                        {this.state.feed!==null?this.state.dropDownText[this.state.dropDownTextIndex]:<Spinner size="sm"/>}
                            </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.fetchFeed();
            this.setState({feed:true, dropDownTextIndex:0, following:[]})
        } }>Feed</DropdownItem>
        <DropdownItem onClick={()=>{
            //fetch following posts
            this.fetchFollowingPosts()
            this.setState({feed:false, dropDownTextIndex:1, feedPosts:[]})
        }}>Following</DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
    <img style={{padding:'2px', marginLeft:'10px'}} className="icon-medium float-left refresh-rotate change-cursor" src={refresh} title="Refresh feed" onClick={()=>{this.refreshFeed()}}></img>
    </Col>
    <Col>
    <Button outline color="danger" className="float-right" onClick={()=>{window.location.assign('/popular')}}>Last 12h most upvoted</Button>
    </Col>
    </Row>

        {(this.state.feed)?this.generateFeedCards():this.generateFollowingItems()}
                        </div>
                        </Col>
                           
                        <Col className="hide-scroll" xs={{size:12, order:1 }}  sm={{size:12, order:1}} md={{size:12, order:1}} lg={{size:3, order:3}}>
                           
                        <Sticky className={this.state.isNotificationsFixed?'':''}  onFixedToggle={(toggle)=>{this.setState({isNotificationsFixed:toggle})}}>
                            <div className={this.state.isNotificationsFixed?'slideDown':''}>
                            <div className="notifications-wrapper background-component" style={{width:'100%', backgroundColor:'whitesmoke', borderRadius:this.state.notificationsIsOpen?'20px':'50px', padding:'20px'}}>
                           {this.NotificationsComponent()}
                            </div>
                            </div>
                        </Sticky>
                         </Col>  
                         
                </Row>
               
                
            </div>
        )
    }
}
const GenerateSkeletonsCard = ()=>{
    const min = 1;
    const max = 3;
    const random = Math.ceil(min + (Math.random() * (max - min)));
    
    let Arr = Array.from(Array(random).keys())
    return Arr.map(element=>{
        return <PostItemScheleton/>
    })
}

const RecentlyScheleton = ()=>{

    return(
        <div className="recently-size">
     <Spinner color="primary"/>
</div>
    )
}



export default HomeLogged;



/**
 * 
 *  OLD SCROLL
 *  handleScroll=()=>{
       
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = Math.round(windowHeight + window.pageYOffset);
        const myCheck = document.scrollingElement.scrollTop;
        const why = (myCheck-300)/10;
        if (windowBottom+120 >= docHeight) {
            this.setState({showSpinner:true, scrollHeightCheck:why})
                this.fetchFeed();
        }
       
    }
 */