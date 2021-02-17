import React from 'react';

import NavBar from '../NavBar/Navbar';
import {Container, Row, Col, Spinner} from 'reactstrap';
import {FormGroup, Label, Input, Button} from 'reactstrap';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import { Media } from 'reactstrap';
import Carousel, {consts} from 'react-elastic-carousel';
import pop from '../../assets/pop.mp3';
import unPop from '../../assets/unPop.mp3';
import ReactPlayer from 'react-player';
import api from '../../constants/api';


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
import './General.css';

/**
 * TODO
 * Upvotes and follow buttons ;
 * Upvotes and follow numbers ;
 * onClick for both.
 */
class PostPage extends React.Component{
    constructor(props){
        super(props)
        this.state={
            user:null,
                id:null,
                post:null,
                up:null,
                follow:null,
                err:null, 
                subscribe:null,
                bigSlide:false,
                bigSlideIndex:null,
        }
    }
    componentWillMount(){
        let path = window.location.pathname;
        let id = path.split('/')[2]
        if(id !== undefined && id !== null){
                this.setState({id:id})
        }
        }
    async componentDidMount(){
            let url=api+'/api/specificPost?id='+this.state.id
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
            console.log('response is ', response)
            if(response.ok === 0){
                this.setState({err:response.err})
                return
            }
            this.setState({post:response.post, user: response.user, subscribe:response.subscribe, up:response.up, follow:response.follow})
        }
        
        myArrow({ type, onClick, isEdge }) {
            const pointer = type === consts.PREV ? '👈' : '👉'
            return (
              <Button style={{backgroundColor:'transparent', border:0}} onClick={onClick} disabled={isEdge}>
                {pointer}
              </Button>
            )
          }
          openBigSlide=()=>{

          }
        showMedia=()=>{
            /**
             * Generate post media
             */
            let mediaShow= (media)=>{
                return media.map(element=>{
                    return(
                        <img style={{width:'100%', height:'100%', padding:this.state.bigSlide?'20px':0}} src={element} onClick={()=>{this.setState({bigSlide:true, bigSlideIndex:1})}} ></img>
                    )
                })
            }
                          return(
                          <div ><Carousel
                            itemsToShow={1}
                            renderArrow={this.myArrow}
                            easing="cubic-bezier(1,.15,.55,1.54)"
                            tiltEasing="cubic-bezier(0.110, 1, 1.000, 0.210)"
                            transitionMs={500}
                            >
                            {mediaShow(this.state.post.media)}
                          </Carousel>
                          </div>)
        }
        /**
         * Generates comments list under authorities response
         */
        generateCommentList=()=>{
            if(this.state.post !== null && this.state.post.comments.length >0 ){
                /**
                 * if comments found, map every comment to a media element
                 */
                let ordComm = this.state.post.comments.reverse();
            return ordComm.map(element=>{
                return(
                    <div style={{marginTop:'1vh'}}>
                    <Media>
                    <Media left href="#">
                      <Media object src={element.avatarUrl} style={{width:'64px', height:'64px', borderRadius:'50%'}} alt="Avatar" />
                    </Media>
                    <Media body>
                      <Media heading className="change-cursor">
                         @{element.postedBy}
                      </Media>
                      {element.body}
                    </Media>
                  </Media>
                  </div>
                )

            })
        
        
        }

              /**
               * No comments found
               */
              return(<div>
                  <p>This post has no comments. Be first to comment it.</p>
              </div>)
        }
        postComment=()=>{
            if(document.getElementById('text-area').value.toString()===""){
                alert('Please fill in the comment area')
                return
            }
            if(this.state.post!== null){
                console.log('why ', document.getElementById('text-area'))
                let comm = document.getElementById('text-area').value.toString()
                let url = api+'/api/comment';
                let options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        token: localStorage.getItem("token").toString()
                    },
                    body: JSON.stringify({
                        body:comm,
                        postID:this.state.post._id,
                    })
                }; 
                fetch(url, options).then(response=>response.json()).then(response=>{
                   
                })
                let newPost = this.state.post;
                let obj = {}
                obj.postId=this.state.post._id.toString();
                obj.postedBy = this.state.user._id.toString();
                obj.avatarUrl= this.state.user.avatarUrl;
                obj.body= document.getElementById('text-area').value.toString();
                obj.postDate= Date.now();
                newPost.comments.push(obj)
                this.setState({post:newPost})
                document.getElementById('text-area').value=""
              
            }
        }
        subscribeToPost=()=>{
            let url = api+'/api/subscribe?id='+this.state.post._id.toString();
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                }
            }; 
            fetch(url, options).then(response=>response.json()).then(response=>{
                console.log('Sub response : ', response)
            })
            this.setState({subscribe:!this.state.subscribe})
        }
        upClick= async()=>{
            //fetch up method
            //upvoted or unupvote
            //increment or decrement number
            if(this.state.up!== null && this.state.up !== undefined){
                let url= api + '/api/up?id='+this.state.post._id.toString();
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
        
            let newPost = this.state.post;
            newPost.upVotes = parseInt(this.state.post.upVotes) + (this.state.up?(-1):(1));
            this.setState({up:!this.state.up, post:newPost})
            }
        }

        followClick=()=>{
            //fetch follow method
            //follow or unfollow
            //increment or decrement number
            if(this.state.follow!== null && this.state.follow !== undefined){
                let url= api + '/api/follow?id='+this.state.post._id.toString();
                let options = {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "Cache-Control": "no-cache, no-store, must-revalidate",
                      Pragma: "no-cache",
                      token: localStorage.getItem("token").toString()
                  }
              };
              fetch(url, options).catch(err=>{
                  console.error("---ctGuard custom error--- : ", err.toString())
              })
            let newPost = this.state.post;
            newPost.followers = parseInt(this.state.post.followers) + (this.state.follow?(-1):(1));
            this.setState({follow:!this.state.follow, post:newPost})
            }
        }
        generateAuthoritiesResponse=()=>{
            if(this.state.post.authoritiesResponse.length>0){
                let desc = this.state.post.authoritiesResponse.reverse()
                return desc.map(element=>{
                    return(
                        <div style={{border:'solid', borderColor:'black', borderWidth:'1px', marginTop:'10px'}}>
                        <Media >
                        <Media left href="#">
                         </Media>
                        <Media body style={{textAlign:'justify'}}>
                          <Media heading>
                              {element.postDate}
                          </Media>
                          <textarea value={element.body} disabled style={{width:'100%', backgroundColor:'white'}}></textarea>
                        </Media>
                        <Media body>
                            <span style={{backgroundColor:'white'}}>
                                {element.previousStatus}&nbsp;->&nbsp;{element.currentStatus}
                            </span>
                        </Media>
                      </Media>
                      </div>
                    )
                })
            }
            return("Authorities didn't provide a response yet")
        }
        handleBigSlide=()=>{
            this.setState({bigSlide:!this.state.bigSlide})
        }
      
    render(){
        console.log('this.state.post ', this.state.post)
        /**
         * If server error, write on screen error message
         */
        if(this.state.err !== null){
            return(<div>
                <NavBar />
                <div>
                    <Container>
                        <Row>
                            <Col>
                    <p className="text-header1" style={{marginTop:'20vh'}}>Resource not found: </p>
                    <p>{this.state.err}</p>
                    <p className="text-header1">Sorry for inconvenience</p>
                    
                    <p className="text-header1">:(</p>
                        </Col>
                        </Row>
                        </Container>
                </div>
            </div>)
        }
        /**
         * If post fetched ok: display post page
         */
        if(this.state.post!== null && this.state.post !== "" && this.state.post !== []){
            console.log('the info I have ', this.state.post)
        
        return(<div>
             <div>
                    
                <Modal 
                size="lg" style={{maxWidth: '1600px', width: '80%', height:'1000px', maxHeight:'1200px'}} isOpen={
                            this.state.bigSlide
                        }
                        toggle={
                            this.handleBigSlide
                    }>
                        <ModalHeader toggle={
                            this.handleBigSlide
                        }>
                        </ModalHeader>
                        <ModalBody>
                    <div className="" style={{height:'80vh'}}>
                        {this.showMedia()}
                    </div>
                        </ModalBody>
                    </Modal>
                </div>
            <div>
                <NavBar/>
            </div>
            <Container style={{background:'#eaeaea'}}>
                <Row>
                    <Col>
                    <p className="text-header1">{this.state.post.header}  ::{this.state.post.category}</p></Col>
                </Row>
                <Row style={{marginTop:'2vh'}}>
                    <Col >
                        <div className="" >
                    {this.state.post && this.showMedia()}
                    </div>
                    </Col>
                    <Col className="">
                <p className="change-cursor" style={{marginTop:'20%'}} onClick={()=>{
                    window.location.assign('/user/'+this.state.post.postedBy)
                }}>Author : @{this.state.post.postedBy}</p>
                <p style={{color:'#ff2e63'}}>Date posted: {this.state.post.datePosted}</p>
                <p style={{color:"#08d9d6"}}>Last update on {this.state.post.datePosted}</p>
                <Row>
                    <Col>
                    <div><img className="change-cursor" src={this.state.up?upDone:upNone} onClick={this.upClick}></img><span>{this.state.post.upVotes}</span></div>
                    </Col>
                    <Col>
                    <div><img className="change-cursor" src={this.state.follow?starDone:starNone} onClick={this.followClick}></img><span>{this.state.post.followers}</span></div>
                    </Col>
                </Row>
                </Col>
                </Row>
                <Row>
                    <Col md="12" lg="auto"><p className="text-header1">Description: </p></Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
                <Row>
                    <Col>
                   
                <p style={{textAlign:'justify'}}>{this.state.post.body}</p>
                </Col>
                </Row>
             
                <Row>
                    <Col md="12" lg="auto"><p className="text-header1">Authorities response: </p></Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
                <Row>
                    <Col style={{textAlign:'justify', minHeight:'10vh',maxHeight:'20vh', paddingBottom:'1.5vh'}}>
                    <div style={{height:'100%', overflowY:'scroll', }}>
                    {this.state.post.authoritiesResponse.length>0 && this.generateAuthoritiesResponse()}
                    {this.state.post.authoritiesResponse.length===0 && <span className="text-body">Authorities didn't provide a response yet</span>}
                    </div>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" lg="auto">
                    <p className="text-header1">Comments section:</p>
                    </Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
                <Row>
                    <Col>
                    <FormGroup>
        <Label for="postCommentBox" className="float-left">Post a comment</Label>
        <Input type="textarea" name="comment-text-box" id="text-area" placeholder="Insert your comment here and press the Post button to post it..." />
       
      </FormGroup>
      {this.state.subscribe!==null?
                this.state.subscribe?
                <Button className="float-left" color="secondary" onClick={this.subscribeToPost}>You are subscribed to comment notifications!</Button>
                :<Button className="float-left" color="primary" onClick={this.subscribeToPost}>Subscribe to comment notifications</Button>
                :null}
      <Button onClick={this.postComment} className="float-right" style={{color:'#08d9d6', marginTop:'1vh'}}>Post!</Button> </Col>
                </Row>
                <Row>
                    <Col className="" style={{textAlign:'justify', maxHeight:'40vh', paddingBottom:'1.5vh', marginTop:'1vh'}}>
                        <div style={{height:'100%', overflowY:'scroll', }}>
                 {this.state.post.comments.length >0 && this.generateCommentList()}
                 {this.state.post.comments.length==0 && <span>This post has no comments yet. Be the first to comment it :)</span>}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>)
        }

        return(<Spinner color="secondary"/>)
    }
    
}


export default PostPage;