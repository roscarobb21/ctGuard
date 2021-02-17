import React, { Component } from 'react';


import NavBar from '../NavBar/Navbar';
import {Container, Row, Col, Spinner} from 'reactstrap';
import {FormGroup, Label, Input, Button, Form, FormText} from 'reactstrap';

import {DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown } from 'reactstrap';

import { Media } from 'reactstrap';
import Carousel from 'react-elastic-carousel';

import ReactPlayer from 'react-player';
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

import api from '../../constants/api';

import './Admin.css';
import '../Pages/General.css';

class AdminPost extends Component {
    constructor(props){
    super(props);
    this.state={
        id:null,
        post:null, 
        user:null,
        subscribe:null,
        follow:null,
        err:null,
        up:null,
        statusDropdown:null,
        categoryDropdown:null,
        categoryChange:false,
        statusChange:false,
        authoritiesPlaceholder:null,
    }
    }
    componentWillMount(){
        let path = window.location.pathname;
        let id = path.split('/')[3]
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
            let placeholderText="";
            response.post.status==="New"?placeholderText+="Write initial commit or block reason":null;
            response.post.status==="In progress..."?placeholderText+="Explain the solving solution or block reason":null;
            response.post.status==="Blocked"?placeholderText+="Reason for bloking":null;
            this.setState({post:response.post, user: response.user, subscribe:response.subscribe, up:response.up, follow:response.follow, statusDropdown:response.post.status, categoryDropdown:response.post.category, authoritiesPlaceholder:placeholderText})
    }

    showMedia=()=>{
        var mediaMap= (media)=>{
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
        if(this.state.err !==null || 1){
        return( <Carousel itemsToShow="1"  swipeable={false} 
            draggable={false} 
            showDots={true}>
                {mediaMap(this.state.post.media)}
                          </Carousel>)}
                          /*
        return(
            <div style={{minWidth:'200px', minHeight:'200px'}}>
                <p style={{alignItems:'center'}}>This post has no media attached</p>
            </div>
        )*/
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

    postResponse=()=>{
        if(document.getElementById("authoritiesText").value.toString()!==""){
            let obj={}
            let body = document.getElementById("authoritiesText").value.toString()
            let url = api+'/admin/response';
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                },
                body: JSON.stringify({
                    body:body,
                    postId:this.state.post._id,
                    category:this.state.categoryDropdown,
                    currentStatus:this.state.statusDropdown
                })
            }; 
            fetch(url, options)
        }
        return null;
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

render(){
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
            <NavBar/>
        </div>
        <Container style={{background:'#eaeaea'}}>
            <Row>
                <Col>
                <p className="text-header1">{this.state.post.header}  ::{this.state.post.category}</p></Col>
            </Row>
            <Row style={{marginTop:'2vh'}}>
                <Col>
                {this.showMedia()}
                </Col>
                <Col>
              
            <p className="change-cursor" style={{marginTop:'25%'}} onClick={()=>{
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
                <Col> <p className="text-header1">Description: </p></Col>
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
                <Col>
             <span>
                <UncontrolledDropdown className="float-left" style={{paddingBottom:'10px'}}>
      <DropdownToggle caret color="primary">
       {this.state.categoryDropdown}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.setState({categoryDropdown:"Request"});
            document.getElementById("authoritiesText").value+="\n #category changed to : Request"
        }}>Request</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({categoryDropdown:"Incident"})
            document.getElementById("authoritiesText").value+="\n #category changed to : Incident"
         }}>Incident</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={()=>{
            this.setState({categoryDropdown:"Covid-19"})
            document.getElementById("authoritiesText").value+="\n #category changed to : Covid-19"
        }}>Covid-19</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    </span>
    <span >
    <UncontrolledDropdown className="float-left" color="primary" style={{paddingBottom:'10px', paddingLeft:'100px'}}>
      <DropdownToggle caret>
        {this.state.statusDropdown}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{this.setState({statusDropdown:"New", authoritiesPlaceholder:"Write Initial commit"})}}>New</DropdownItem>
        <DropdownItem onClick={()=>{this.setState({statusDropdown:"In progress...", authoritiesPlaceholder:"Write progress steps"})}}>In progress...</DropdownItem>
        <DropdownItem onClick={()=>{this.setState({statusDropdown:"Solved", authoritiesPlaceholder:"Explain how the matter was solved"})}}>Solved</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={()=>{this.setState({statusDropdown:"Blocked", authoritiesPlaceholder:"Write the reason why post was blocked or declined"})}}>Blocked</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    </span>
                <p style={{textAlign:this.state.post.authoritiesResponse===""?'center':'justify'}}>
                    <Form>
                <FormGroup>
                <Label for="exampleText"></Label>
                    <Input type="textarea" name="text" id="authoritiesText" className="textarea-admin" heigh="10vh" placeholder={this.state.authoritiesPlaceholder} />
                </FormGroup>
                <FormGroup>
                 <Input type="file" name="file" id="authoritiesFile" />
                    <FormText  className="float-left" color="muted">
                        Upload file to confirm the statement
                </FormText>
      </FormGroup>
    
                <Button className="float-right" style={{color:'#08d9d6', marginTop:'1vh'}} onClick={this.postResponse}>Post Response</Button>
               
                    </Form>
                </p>
                </Col>
            </Row>
            <Row>
                    <Col style={{textAlign:'justify', height:this.state.post.authoritiesResponse.length>5?'50vh':'20vh', paddingBottom:'1.5vh'}}>
                    <div style={{height:'100%', overflowY:'scroll', }}>
                    {this.state.post.authoritiesResponse.length>0 && this.generateAuthoritiesResponse()}
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
                <Col style={{textAlign:'justify'}}>
             {this.generateCommentList()}
                </Col>
            </Row>
        </Container>
    </div>)
    }

    return(<Spinner color="secondary"/>)
}
}

export default AdminPost;