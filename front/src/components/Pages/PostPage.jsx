import React from 'react';

import NavBar from '../NavBar/Navbar';
import {Container, Row, Col, Spinner} from 'reactstrap';
import {FormGroup, Label, Input, Button} from 'reactstrap';

import { Media } from 'reactstrap';
import Carousel from 'react-elastic-carousel';

import ReactPlayer from 'react-player';
import api from '../../constants/api';
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
            this.setState({post:response.post, user: response.user})
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
                      <Media object src={element.avatarUrl} style={{width:'64px', height:'64px'}} alt="Avatar" />
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
                })
              
            }
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
                    <Col><div className="upvotes-wrapper"> upvotes</div></Col>
                </Row>
                <Row>
                    <Col md="12" lg="auto"><p className="text-header1">Authorities response: </p></Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
                <Row>
                    <Col>
                    <p style={{textAlign:this.state.post.authoritiesResponse===""?'center':'justify'}}>{this.state.post.authoritiesResponse===""?"Authorities didn't provide a response yet":this.state.post.authoritiesResponse}</p>
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
        <Label for="postCommentBox">Post a comment</Label>
        <Input type="textarea" name="comment-text-box" id="text-area" placeholder="Insert your comment here and press the Post button to post it..." />
        
      </FormGroup>
      
      
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


export default PostPage;