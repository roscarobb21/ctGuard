import React from 'react';

import NavBar from '../NavBar/Navbar';

import {Container, Row, Col, Spinner} from 'reactstrap';
import {FormGroup, Label, Input, Button} from 'reactstrap';
import { Media } from 'reactstrap';
import Carousel, {consts} from 'react-elastic-carousel';
import pop from '../../assets/pop.mp3';
import unPop from '../../assets/unPop.mp3';
import Notification from '../../assets/notification.wav';


import { Badge } from 'reactstrap';
import api from '../../constants/api';
import Divider from '@material-ui/core/Divider';
import moment from 'moment';

import notFoundImg from '../../assets/notFoundError.png';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { InView } from 'react-intersection-observer';

import Video from 'react-responsive-video';
import Skeleton from 'react-loading-skeleton';

/**
 * upvote svg
 */
 import upNone from '../../assets/upNone.png';
 import upDone from '../../assets/upDone.png';
/**
 * follow svg
 */
 import starNone from '../../assets/starNone.png';
 import starDone from '../../assets/starDone.png';


import followSound from '../../assets/followSound.wav';
import PlaceImg from '../../assets/global.png';
import bellDone from '../../assets/bellDone.svg';
import bellNone from '../../assets/bellNone.svg';

import expandPng from '../../assets/expand.png';
import postComment from '../../assets/arrow.png';

import LargeMedia from '../LargeMediaViewer/LargeMediaViewer'

import Footer from '../Footer/Footer';

import './Admin.css';

const io = require("socket.io-client");
/**
 * TODO
 * Upvotes and follow buttons ;
 * Upvotes and follow numbers ;
 * onClick for both.
 */




class AdminPost extends React.Component{
constructor(props){
super(props)
this.state={
    myID:null,
    myUsername:null,
    myAvatarUrl:null,
    previousStatus:null,
    err:"",
    postBodyExpand:false,
    loading:true,
    id:null,
    post:null,
    up: null,
    follow: null,
    subscribe:null,
    comment:"",
    commentArray:[],
    latestCommentArrived:false,
    showCommentSpinner:false,
    fetchNewCommButton:false,
    authoritiesResponse:"",
    statusDropdown:null,
    categoryDropdown:null,
    upVotesNum:null,
    replacePost:false,
}

}
//get notification if someone posted a comment while you are viewing the page
//implementation on component did mount
socket = io(api.backaddr);
callbackFunction = (childData) => {
    console.log("🚀 ~ file: PostPage.jsx ~ line 588 ~ PostPage ~ childData", childData)
    this.setState({showDialog:childData})
   }
   

AdminPostResponse=()=>{
    if(this.state.authoritiesResponse.length===0){
        alert('You cannot leave the response empty!')
        return
    }
    this.setState({replacePost:true})
    let pid = this.state.post._id.toString();
    let body = this.state.authoritiesResponse.toString();
    let category = this.state.categoryDropdown===null?this.state.post.category:this.state.categoryDropdown;
    let status = this.state.statusDropdown===null?this.state.post.status:this.state.statusDropdown;
    let url = api.backaddr + api.admin+ api.adminRoutes.postResponse;
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        },
        body:JSON.stringify({
            postId:pid,
            body: body,
            category:category,
            currentStatus:status
        }),
    };
    let obj = {}
    obj.avatarUrl = this.state.myAvatarUrl;
    obj.body = body;
    obj.category = category;
    obj.currentStatus = status;
    obj.postedByUsername = this.state.myUsername
    obj.postDate = moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
    obj.previousStatus = this.state.post.status
    let newPost = this.state.post
    newPost.authoritiesResponse.push(obj)
    this.socket.emit("postResponse")
    // this.socket.on('postResponsefetch', (pid)=>{
    //     //increment number on pid from notificationsFeed on fetch
    //    alert("something")
    //  })

    fetch(url, options).then(response=>response.json()).then(response=>{
        this.setState({post:newPost, authoritiesResponse:"", replacePost:false})
    })

}



getMyID = ()=>{
    let url=api.backaddr + api.authUser + api.routes.myID;
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
       console.log("🚀 ~ file: AdminPost.jsx ~ line 157 ~ AdminPost ~ fetch ~ response", response)
       if(response.ok === 1){
           this.setState({myID:response.myID, myAvatarUrl:response.avatarUrl, myUsername:response.username})
       }
   })

}
getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

postBodyTextExpandOrCollapse = ()=>{
const textLength = this.state.post.body.length;

//let lengthDrop = this.getRandomArbitrary(300, 500);
if(textLength >= 500 && this.state.postBodyExpand){
    return(<div  className="post-body-expand" style={{}}>
        <span>{this.state.post.body} </span>
        &nbsp;
        <span style={{color:'blue'}} className="change-cursor" onClick={()=>{this.setState({postBodyExpand:false})}}>Read less</span>
    </div>)

}
if(textLength >= 500 && !this.state.postBodyExpand){
   return (<div className="post-body-expand" style={{}}>
        <span>{this.state.post.body.substring(0, 500)}... </span>
        &nbsp;
        <span style={{color:'blue'}} className="change-cursor" onClick={()=>{this.setState({postBodyExpand:true})}}>Read more</span>
    </div>)
    
}

return(<span>{this.state.post.body}</span>)
}

componentWillMount(){
    /**
     * Get the post id from url
     */
     const id = this.props.match.params.id;
 
        if(id !== undefined && id !== null){
            console.log("ID IS : ", id)
                this.setState({id:id})
        }
}
componentWillUnmount() {
    document.removeEventListener('scroll', this.trackCommentScrolling);
  }

componentDidMount(){
    document.addEventListener('scroll', this.trackCommentScrolling);
    
    this.socket.emit('post_view', this.state.id);
    this.socket.on("new", (fromId)=>{
        //altcineva inafara de mine a postat
        if(fromId !== this.state.myID){
            let audio = new Audio(Notification);
            audio.play()
            this.setState({fetchNewCommButton:true})
        }
    })

    /**
     * Fetch post data
     */
    this.getMyID();
    let url=api.backaddr+'/api/specificPost?id='+this.state.id
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
                console.log("POST RESPONSE: ", response)
               if(response.ok === 1){
                  let color;
                switch(response.post.category){
                    case "Incident":
                        color = "#ff2e63";
                        break;
                    case "Request":
                        color = "#00adb5";
                        break;
                    default:
                        color = "black";
                        break;
                }
                this.setState({color:color, loading:false, post:response.post, authResponse:response.post.authoritiesResponse, up:response.up, follow:response.follow, subscribe:response.subscribe, commentArray:response.post.comments, followNum:response.followNum, upVotesNum:response.upVotesNum})

               }else {
                this.setState({loading:false,err:response.err })
               }
            })
}

imageItem = (med)=>{
    let path = api.cdn+ api.postMedia.p720+med
    return(
        <div className="" style={{background:'url('+path+')',backgroundSize: 'cover',backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat', minHeight:'500px', minWidth:'100%'}} 
        onMouseEnter={()=>{
            //displayExpand
            this.setState({expandBtn:true})
        }}
        onMouseLeave={()=>{
            this.setState({expandBtn:false})
            //hide Expand
        }}>  
            <div className="expand-button" style={{display:this.state.expandBtn?'block':'none',left:20, transition:'opacity 1s ease'}}>
              <img style={{width:'48px', height:'48px', marginLeft:'20px', marginTop:'30px'}} src={expandPng} className="float-left change-cursor" title="Expand Media" onClick={()=>{
                  let id ;
                  this.state.post.media.forEach((element, i ) => {
                      if(element === med ){
                          id=i;
                      }
                  });
                  
                  this.setState({showDialog:true, dialogId:med, expandId:id})
                  
                  }}></img>
            </div>
        </div>
    )
}
videoItem = (med, inView)=>{
    let path = api.cdn+ api.postMedia.p720+med
    return(
        <div id="cauta" className="" 
        onMouseEnter={()=>{
            //displayExpand
            this.setState({expandBtn:true})
        }}
        onMouseLeave={()=>{
            this.setState({expandBtn:false})
            //hide Expand
        }}
        style={{display:'flex',alignItems:'center',minHeight:'500px', minWidth:'100%', backgroundColor:'#303030'}}>
            <div style={{position:'relative'}}>
             <div className="expand-button" style={{display:this.state.expandBtn?'block':'none', position:'absolute', top:0, left:20, zIndex:'1000'}}>
              <img style={{width:'48px', height:'48px', marginRight:'30px', marginTop:'30px', zIndex:999}} src={expandPng} className="float-right change-cursor" title="Expand Media" onClick={()=>{
                     let id ;
                     this.state.post.media.forEach((element, i ) => {
                         if(element === med ){
                             id=i;
                         }
                     });
                  
                  this.setState({showDialog:true, dialogId:med, expandId:id})}}></img>
            </div>
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
   </div>
    )
}




mediaMap = (media, inView)=>{
    return media.map(element=>{
        if(element.split('.')[1]==='mp4'){
            //return video item
           return(this.videoItem(element))
        }else {
            //return img item
            return(this.imageItem(element))
        }
    })

}

generatePostCarousel = (media, inView)=>{
    if(media.length === 0){
        return(<div><span>This post has no media attached</span></div>)
    }
    return(
    <Carousel
        itemsToShow={1}
        showArrows={media.length===1?true:true}
        disableArrowsOnEnd={false}
        showArrows={true}
        enableMouseSwipe={false}>
            { 
            this.mediaMap(media, inView)
            }
        </Carousel>
    )
}


/**
 * Authorities Response section
 * 
 */

generateAuthoritiesResponse = ()=>{
    if(this.state.post.authoritiesResponse.length === 0){
        return (
            <div>
                <p>Authorities didn't provide a response yet</p>
                </div>
        )
    }
    let authoritiesReverse = this.state.post.authoritiesResponse.reverse();
    console.log("🚀 ~ file: AdminPost.jsx ~ line 367 ~ AdminPost ~ authoritiesReverse", authoritiesReverse)
    return authoritiesReverse.map((element, i)=>{
        return(
            <div>
                {this.AuthoritiesResponseBubble(element)}
            </div>
        )
    })

}

AuthoritiesResponseBubble = (element, i)=>{

    return(
        <div style={{marginTop:i===0?'0px':'25px'}}>
             <Media className="mt-1">
                            <Media left middle href={"/user/"+element.postedBy}> 
                                <img style={{width:'64px', height:'64px', borderRadius:'50%'}} src={api.cdn+api.avatarMedia.p128+element.avatarUrl} alt={element.postedByUsername}></img>
                            </Media>
                            <Media body>
                            <Media heading >
                                <a href={"/user/"+element.postedBy}><p style={{textAlign:'justify'}} > <Badge color="secondary">@{element.postedByUsername}</Badge></p>  </a> 
                                
                            </Media>
                                <div style={{textAlign:'justify'}}><span>{element.body}</span></div>
                                <small className="text-muted float-left" ><span>Status change : {element.previousStatus}-> {element.currentStatus}</span></small>
                                <br></br>
                                <small className="text-muted float-left" ><span>{ moment(element.postDate).format("MMMM Do YYYY, h:mm:ss a")}</span></small>
                            </Media>
                        </Media>
                    <Divider/>
            </div>
    )

}

/**
 * 
 * Comments section
 */

/**
 * reFetch comments for pagination :
 * provide the latest comment id !
 */

refetchComments = (latestId)=>{
    if(this.state.latestCommentArrived!==true){
        console.log("Latest id i got : ", latestId)
        this.setState({latestCommentArrived:true})
        let url=api.backaddr+api.authUser+api.routes.recomment+"?pid="+this.state.id+"&lcid="+latestId;
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
           console.log("COMM RESPONSE : ", response)
           if(response.ok === 1){
               if(response.bottom){
                let oldComm = this.state.commentArray;
                let newComm = response.newComments;
                let updateComm = oldComm.concat(newComm)
                this.setState({commentArray:updateComm,latestCommentArrived:response.bottom })
                return
               }
                if(response.newComments.length === 0 ){
                    //replace loading with bottom
                }else {
                    let oldComm = this.state.commentArray;
                    let newComm = response.newComments;
                    let updateComm = oldComm.concat(newComm)
                    this.setState({commentArray:updateComm,latestCommentArrived:false})

                }
           }
       })
    }

}

 commentSubscribe=()=>{
    this.setState({subscribe:!this.state.subscribe})
    let url=api.backaddr+api.authUser+api.routes.subscribe+this.state.id;
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

 /**
  * 
  * @returns POST NEW COMMENT
  */
  commentPost = ()=>{
    if(this.state.comment.length === 0){ return; }
    let url=api.backaddr+api.authUser+api.routes.postComment;
  
    let obj = {}
            obj.postId=this.state.post._id;
            obj.body= this.state.comment;
            
    let options = {
       method: "POST",
       headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache, no-store, must-revalidate",
           Pragma: "no-cache",
           token: localStorage.getItem("token").toString()
       },
       body:JSON.stringify({
           postID:this.state.post._id,
           body: this.state.comment
       }),
   };
   document.getElementById("commentTextArea").value = "";
   let audio = new Audio(pop)
   audio.play();
   fetch(url, options).then(response=>response.json()).then(response=>{
       if(response.ok === 1){
           this.setState({commentArray:response.newArray, comment:''})
       }
   })
   obj.postDate= Date.now();
}

/**
 * Generates comment bubbles
 * 
 *    <InView>
                     {({ inView, ref, entry }) => (
                 <div ref={ref} style={{padding:''}}>
                                {this.generatePostCarousel(this.state.media, inView)}
                                 </div>
                      )}
                         </InView>
 */
generateCommentBubble = (comment, i)=>{



  if(this.state.commentArray.length === (i+1) && !this.state.latestCommentArrived){
      //latest Element
      //inset ref to latest element to re-fetch if in view
      return(
        <InView>
        {({ inView, ref, entry }) => {      
            if(inView){this.refetchComments(comment._id)}
            return(      
    <div ref={ref} className="comment-bubble">
                        <Media className="mt-1">
                            <Media left middle href={"/user/"+comment.postedBy}> 
                                <img style={{width:'64px', height:'64px', borderRadius:'50%'}} src={api.cdn+api.avatarMedia.p128+comment.avatarUrl} alt={comment.postedByUsername}></img>
                            </Media>
                            <Media body>
                            <Media heading >
                                <a href={"/user/"+comment.postedBy}><p style={{textAlign:'justify'}} > <Badge color="secondary">@{comment.postedByUsername}</Badge></p> </a> 
                            </Media>
                                <p style={{textAlign:'justify'}}>{comment.body}</p>
                                <small className="text-muted float-left" >{moment(comment.postDate).format("MMMM Do YYYY, h:mm:ss a")}</small>
                            </Media>
                        </Media>
                    <Divider/>
      <br></br>
      {this.state.latestCommentArrived?<Spinner/>:null}
                    </div>
            )}}
            </InView>
      )
  }
  if(this.state.commentArray.length === (i+1) && this.state.latestCommentArrived){
return(
<div className="comment-bubble">
    <Media className="mt-1">
        <Media left middle href={"/user/"+comment.postedBy}> 
            <img style={{width:'64px', height:'64px', borderRadius:'50%'}} src={api.cdn+api.avatarMedia.p128+comment.avatarUrl} alt={comment.postedByUsername}></img>
        </Media>
        <Media body>
          <Media heading >
              <a href={"/user/"+comment.postedBy}><p style={{textAlign:'justify'}} > <Badge color="secondary">@{comment.postedByUsername}</Badge></p> </a> 
          </Media>
         <p style={{textAlign:'justify'}}>{comment.body}</p>
         <small className="text-muted float-left" >{moment(comment.postDate).format("MMMM Do YYYY, h:mm:ss a")}</small>
        </Media>
      </Media>
      <Divider/>
      
      <br></br>
      <div><span>You have reached to the bottom of comments</span></div>
</div>
)
}

return(
    <div className="comment-bubble">
        <Media className="mt-1">
            <Media left middle href={"/user/"+comment.postedBy}> 
                <img style={{width:'64px', height:'64px', borderRadius:'50%'}} src={api.cdn+api.avatarMedia.p128+comment.avatarUrl} alt={comment.postedByUsername}></img>
            </Media>
            <Media body>
              <Media heading >
                  <a href={"/user/"+comment.postedBy}><p style={{textAlign:'justify'}} > <Badge color="secondary">@{comment.postedByUsername}</Badge></p> </a> 
              </Media>
             <p style={{textAlign:'justify'}}>{comment.body}</p>
             <small className="text-muted float-left" >{moment(comment.postDate).format("MMMM Do YYYY, h:mm:ss a")}</small>
            </Media>
          </Media>
          <Divider/>
          <br></br>
    </div>
    )
}


generateComments = ()=>{
if(this.state.commentArray.length === 0 ){
    return(<div><span>There are no comments on this post, be the first to comment it !</span></div>)
}

return(this.state.commentArray.map((element, i)=>{
    return(
        this.generateCommentBubble(element, i )
    )
}))
}
clearNotificationsQ=()=>{
    console.log("clear Q")
    let url= api.backaddr + api.authUser + api.routes.clearNotificationQ + this.state.id;
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

loadCommentsPromptfetch = ()=>{
    //also clear notificationQ for this post
    
    let url=api.backaddr+api.authUser+api.routes.appendComment+"?pid="+this.state.id+"&lcid="+this.state.commentArray[0]._id;
    let options = {
       method: "GET",
       headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache, no-store, must-revalidate",
           Pragma: "no-cache",
           token: localStorage.getItem("token").toString()
       }
   };
   this.clearNotificationsQ();    
   fetch(url, options).then(response=>response.json()).then(response=>{
       let oldArr = this.state.commentArray;
       let newGet = response.newComments;
       let forUpdate = newGet.concat(oldArr);
       this.setState({commentArray:forUpdate, fetchNewCommButton:false})
   })

}


render(){
 
    if(this.state.loading){
        return(<div>
            <NavBar/>
            <Container style={{height:'90vh'}}>
            <div className="post-presentation background-component" style={{ backgroundColor:'white', borderRadius:'20px', width:'100%', padding:'20px', marginTop:'30px'}} > 
                        <Row>
                            <Col>
                                <section>
                                    <div style={{padding:'25px', wordWrap:'break-word', width:'100%', textAlign:'left'}}>
                                      <Skeleton className="skeleton-theme" height={60} count={1}/>
                                        </div>
                                </section>
                                <section style={{paddingRight:'20px'}}className="float-right">
                                </section>
                                </Col>
                                </Row>
                               <Row style={{marginTop:'10px'}}>
                                   <Col>
                                   <div style={{textAlign:'justify', padding:'0px 25px 0px 25px'}}>
                               
                                   <Skeleton className="skeleton-theme" height={15} count={4}/>
                                  </div>
                                   </Col>
                               </Row>
                               <Row style={{marginTop:'30px'}}>
                                   <Col>
                                  
                                <div style={{padding:'25px'}}>
                                <Skeleton className="skeleton-theme" height={200} count={1}/>
                                 </div>
                  
                                   </Col>
                               </Row>
                               <Divider/>
                              <div style={{padding:'20px'}}>
                                     <div className="">
                                       
                                   <Skeleton className="skeleton-theme" height={15} count={1}/>
                                     </div>
                              </div>

                        </div>
            </Container>
            </div>)
    }
    /**
     * Error
     */
     if((this.state.post === null || this.state.post === undefined) && !this.state.loading){
        return(<div>
            <div>
            <NavBar/>
        </div>
            <div style={{minHeight:'96vh'}}>
                <Container style={{height:'inherit'}}>
                    <Row style={{height:'inherit', marginTop:'30px'}}>
                        <Col style={{height:'inherit'}}>
                        <div className="background-component d-flex justify-content-center" style={{minHeight:'350px', borderRadius:'20px'}}>
                        <img className="icon-xlarge align-self-center" src={notFoundImg}></img>
                      <span className="text-header2 align-self-center">{this.state.err.length>0?this.state.err:""}</span>
                       </div>
                        </Col>
                    </Row>
                </Container>
                
            </div>
            <Footer/>
        </div>)
    }

/**
 * Post fetched ok
 */
 let statusColor;
 switch(this.state.post.status){
     case "New":
         statusColor="#08d9d6";
         break;
     case "In progress...":
         statusColor="#f9b208";
         break;
     case "Solved":
         statusColor="#00adb5";
         break;
     case "Blocked":
         statusColor="#ff2e63";
         break;
     default:
         statusColor="black";
         break;
 }

    return(<div className="background">
        <NavBar/>
        <div>
        <LargeMedia showDialog={this.state.showDialog} expandId={this.state.expandId} parentCallback = {this.callbackFunction} media={this.state.post.media} username={this.state.post.postedByUsername} title={this.state.post.header} country={this.state.post.country} region={this.state.post.region}/>
           
            <Container >
            <Row style={{marginTop:'30px'}}>
                    <Col >
                        <div className="post-presentation background-component" style={{ backgroundColor:'white', borderRadius:'20px', width:'100%', padding:'20px'}} > 
                        <Row>
                            <Col>
                                <section>
                                    <div className={this.state.post.header.length>30?"text-header2":"text-header1"} style={{padding:'25px', wordWrap:'break-word', width:'100%', textAlign:'left'}}>
                                        {this.state.post.header} ::<span style={{color:this.state.color}}>{this.state.post.category}</span>
                                        </div>
                                </section>
                                <section style={{paddingRight:'20px'}}className="float-right">
                                    <img src={PlaceImg} style={{width:'32px', height:'32px'}}></img>
                                    &nbsp;
                                    <span>{this.state.post.country},</span>&nbsp;
                                    <span>{this.state.post.region}</span>
                                </section>
                                </Col>
                                </Row>
                               <Row style={{marginTop:'10px'}}>
                                   <Col>
                                   <div style={{textAlign:'justify', padding:'0px 25px 0px 25px'}}>
                                  {this.postBodyTextExpandOrCollapse()}
                                  </div>
                                   </Col>
                               </Row>
                               <Row style={{marginTop:'30px'}}>
                                   <Col>
                                   <InView>
                     {({ inView, ref, entry }) => (
                 <div ref={ref} style={{padding:'25px'}}>
                                {this.generatePostCarousel(this.state.post.media, inView)}
                                 </div>
                      )}
                         </InView>
                                   </Col>
                               </Row>
                               <Divider/>
                              <div style={{padding:'20px'}}>
                                  <div className="float-left">
                                 <img style={{width:'32px', height:'32px'}} className="change-cursor" src={this.state.up?upDone:upNone} onClick={()=>{
                                     let audio = new Audio(this.state.up?unPop:pop);
                                     audio.play()
                                     let url = api.backaddr + '/api/up?id=' + this.state.post._id.toString()
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
                                    let newUpVotesNum = this.state.upVotesNum;
                                    newUpVotesNum += + this.state.up?(-1):(1)
                                    this.setState({up:!this.state.up, upVotesNum: newUpVotesNum})
                                     }}></img>
                                  
                                  &nbsp; <span>{this.state.upVotesNum}</span>  &nbsp;  &nbsp;  
                                  
                                 <img style={{width:'32px', height:'32px'}} className="change-cursor" src={this.state.follow?starDone:starNone} onClick={()=>{

                                     if(!this.state.follow){
                                        let audio = new Audio(followSound);
                                        audio.play()
                                     }
                                        let url = api.backaddr + '/api/follow?id=' + this.state.post._id.toString()
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
                                        let newFollowNum = this.state.followNum;
                                        newFollowNum += + this.state.follow?(-1):(1)
                                     this.setState({follow:!this.state.follow, followNum:newFollowNum})
                                     
                                     }}></img> &nbsp;  <span>{this.state.followNum} </span>
                                
                                     </div>
                                     <div className="float-right">
                                        <small>
                                            <a title={'Link to '+this.state.post.postedByUsername+'\'s profile'} href={'/user/'+this.state.post.postedBy} className="" >@{this.state.post.postedByUsername}</a>
                                            &nbsp;<span>{moment(this.state.post.datePosted).format("MMMM Do YYYY, h:mm:ss a")}</span>&nbsp;<span style={{color:statusColor}}>{this.state.post.status}</span></small>
                                     </div>
                              </div>

                        </div>
                    </Col>
                </Row>
                                    <br></br>
                <Row style={{minHeight:'350px' }}>
                        <Col>
                        <div className="post-presentation background-component" style={{minHeight:'400px',backgroundColor:'white', borderRadius:'20px', width:'100%', padding:'20px 40px 20px 40px'}} > 
                        <Row   className="">
                            <Col style={{minHeight:'350px'}}>
                            <p className="text-header1 float-left">Authorities Response</p>
                            <p className="float-left">Latest update on <span style={{color:"#08d9d6"}}>{moment(this.state.post.lastUpdated).format("MMMM Do YYYY, h:mm:ss a")}</span></p>
                            </Col>
                            <Col style={{minHeight:'350px',maxHeight:'450px', overflowY:'scroll'}}>
                            <div className='' style={{}}>
                            {this.generateAuthoritiesResponse()}
                            </div>
                            </Col>
                        </Row>
                      
                        <Row>
                            <Col xs="12" sm="12" md="12" lg="12" xl="12">
                            <FormGroup>
                                <Label for="postResponse" className="float-left"><span>Post response</span></Label>
                                <Input type="textarea" name="postResponse" id="postResponseTextArea" 
                                disabled={this.state.post.status==="Blocked"?true:false}
                                style={{minHeight:'150px'}}
                                value={this.state.authoritiesResponse}
                                placeholder="Post your response here"
                                spellCheck="false"
                                onChange={(evt)=>{this.setState({authoritiesResponse:evt.target.value})}}
                                />
                            </FormGroup>
                            </Col>
                            <Col xs="12" sm="12" md="12" lg="12" xl="12">
                                <div className="float-left">
                                <UncontrolledDropdown>
                                    <DropdownToggle caret>
                                        {this.state.statusDropdown===null?"Change Status":this.state.statusDropdown}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={()=>{this.setState({statusDropdown:"New"})}}>New</DropdownItem>
                                        <DropdownItem onClick={()=>{this.setState({statusDropdown:"In progress..."})}}>In progress...</DropdownItem>
                                        <DropdownItem onClick={()=>{this.setState({statusDropdown:"Solved"})}}>Solved</DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem onClick={()=>{this.setState({statusDropdown:"Blocked"})}}><span className="text-danger">Blocked</span></DropdownItem>
                                    </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                                <div className="float-left" style={{marginLeft:'10px'}}>
                                <UncontrolledDropdown>
                                    <DropdownToggle caret>
                                        {this.state.categoryDropdown===null?"Change Category":this.state.categoryDropdown}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={()=>{this.setState({categoryDropdown:"Request", authoritiesResponse:this.state.authoritiesResponse+"\n #category changed to Request"})}}>Request</DropdownItem>
                                        <DropdownItem onClick={()=>{this.setState({categoryDropdown:"Incident", authoritiesResponse:this.state.authoritiesResponse+"\n #category changed to Incident"})}}>Incident</DropdownItem>
                                        <DropdownItem onClick={()=>{this.setState({categoryDropdown:"Covid-19", authoritiesResponse:this.state.authoritiesResponse+"\n #category changed to Covid-19"})}}>Covid-19</DropdownItem>
                                    </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                                {this.state.replacePost && <Spinner className="float-right" color="primary"/>}
                               {!this.state.replacePost&& <Button className="float-right" color="primary" onClick={this.AdminPostResponse}>Post!</Button>}
                            </Col>
                        </Row>
                        </div>
                        </Col>
                </Row>
              <br></br>
                <Row >
                    <Col>
                    <div className="post-presentation background-component" style={{minHeight:'50vh', borderRadius:'20px', width:'100%', padding:'40px'}} > 
                       <Row>
                           <Col>
                           
                           <div className="float-left">
                        <p className="text-header1">Comments Section</p>
                        
                        </div>
                        </Col>
                        <Col className="">
                        <div className="float-right  float-right">
                            <img className="change-cursor" style={{width:'32px', height:'32px'}} src={this.state.subscribe?bellDone:bellNone} title={this.state.subscribe?"Unsubscribe from comment notifications":"Subscribe to comment notifications"}onClick={this.commentSubscribe}></img>
                       
                            </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <FormGroup>
                                <Label for="commentTextArea" className="float-left"><span>Comment this post</span></Label>
                                <Input type="textarea" name="text" id="commentTextArea" 
                                placeholder="Insert your comment here"
                                spellCheck="false"
                                value={this.state.comment}
                                onChange={(evt)=>{this.setState({comment:evt.target.value})}}
                                onKeyDown={(evt)=>{
                                    console.log("EVT : ", evt);
                                    if(evt.key==="Enter"){
                                        this.commentPost()
                                    }
                                }}
                                />
                            </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            {this.state.fetchNewCommButton && <small className="float-left change-cursor" style={{color:"#00adb5"}} onClick={()=>{
                                    this.loadCommentsPromptfetch()
                            }}>Someone wrote a new comment, do you wish to load it?</small>}
                            </Col>
                            <Col>
                            <img className="float-right change-cursor" src={postComment} style={{width:'32px', height:'32px'}} onClick={this.commentPost} title="Post Comment"></img>
                            </Col>
                        </Row>
                        <Row style={{marginTop:'30px'}}>
                            <Col>
                            <div id="comments-section" style={{maxHeight:'600px', overflowY:'scroll'}}>
                                {this.generateComments()}
                                </div>
                            </Col>
                        </Row>
                    </div>
                    </Col>
                </Row>
            </Container>
        </div>
    </div>)
}

}


const MediaScheleton = ()=>{

    return(
        <div className="comment-bubble">
            <Media className="mt-1">
                <Media left middle > 
                    <div style={{width:'64px', height:'64px', borderRadius:'50%'}}  >GG</div>
                </Media>
                <Media body>
                  <Media heading >
                      <p style={{textAlign:'justify'}} > <Badge color="secondary">@GG</Badge></p>
                  </Media>
                 <p style={{textAlign:'justify'}}>GG</p>
                 <small className="text-muted float-left" >GG</small>
                </Media>
              </Media>
              <Divider/>
              <br></br>
        </div>
        )

}



const PostPageScheleton = ()=>{
    return(
    <div style={{width:'100%', height:'100%'}}>
  
        <Skeleton height={300} count={1} width={'100%'}>
        </Skeleton>
</div>)

}

export default AdminPost;



