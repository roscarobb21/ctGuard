import React from 'react';
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';
import {Container, Row, Col} from 'reactstrap';
import {Card, CardBody, CardFooter, CardTitle} from 'reactstrap';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {Spinner} from 'reactstrap';

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
/**
 * Chat svg
 */
import msg from '../../assets/msg.svg';
import profileImg from '../../assets/ProfileImg.png'

function PostMedia(props){
/**
 * 21f95ac70ffa735b80b1ce8c8b457b
 */
console.log('Post media props ', props.props)
if(props.props.length===0){
return(<div>No media attached</div>)
}
    return(<div>
      
      <Carousel itemsToShow={1}>
          {
              props.props.map((element)=>{
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
 
     </div>)
}
class ProfileNotFriend extends React.Component{
constructor(props)
{
    super(props)
    this.state={
        id:null,
        avatarUrl:null,
        username:null, 
        posts:null,
        up:null,
        follow:null,
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
if(this.state.id !== null && this.state.id !== undefined){
        let url = api+'/api/user?id='+this.state.id;
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
        console.log('User reponse : ', response)
        if(response.ok === 1){
            let getInfoUrl = api+'/api/upfollow'
            let infoOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                }
            };
            let infoResponseRaw = await fetch(getInfoUrl, infoOptions);
            let infoResponse = await infoResponseRaw.json();
        this.setState({avatarUrl:response.user.avatarUrl, username:response.user.username, posts:response.user.posts, up:infoResponse.info[0], follow:infoResponse.info[1]})
    }else if(response.ok ===3 ){
        window.location.assign('http://localhost:3000/profile')
    }

}
}
generateMyPostsCards = (posts) => { // fetch my latest posts
    if (this.state.posts === null || this.state.posts.length === 0) {
        return (
            <div>
                <p>You don't have any posts yet</p>
            </div>
        )
    }
    return this.state.posts.map((post) => {
      
        return (
            <div>
                <div className="my-post-item">
                    <Row>
                        <Col md="2"></Col>
                        <Col md="8">
                            <Card>
                                <CardTitle>{post.header.length>20?post.header.substring(0, 20)+"":post.header}</CardTitle>
                                <CardBody>
                                    <PostMedia props={post.media}/>
                                </CardBody>
                    <CardBody>asdasd</CardBody>
                    <CardFooter>
                        <img className="change-cursor" src={this.state.up.includes(post._id.toString())?upDone:upNone} onClick={async ()=>{
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
console.log("response on click ", response)
this.setState({up:response.upVoted})

}
                        }></img>
                        <img  className="change-cursor" src={this.state.follow.includes(post._id.toString())?starDone:starNone} onClick={async ()=>{


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
  console.log('response is ', response)
  this.setState({follow:response.followNew})
          
                        }}></img>
                    </CardFooter>
                            </Card>
                        </Col>
                        <Col md="2"></Col>
                    </Row>
                </div>

            </div>
        );
    })


}
render(){
    console.log("RENDER AVATARURL ", this.state.up)
    if(this.state.id === null){
        return(<p>null</p>)
    }
    if(this.state.username === null && this.state.avatarUrl === null && this.state.up === null && this.state.follow === null){
        return(<p><Spinner color="secondary"/></p>)
    }
    return(
    <div><div>
        <NavBar/>
    </div>
    <div>
        <Row>
            <Col md="3"></Col>
            <Col md="6">

            <div>
                                <img src={
                                        this.state.avatarUrl === null ? profileImg : this.state.avatarUrl
                                    }
                                    className="profile-img"
                                    onClick={
                                        this.handleModal
                                }></img>
                                <p className="text-header1">
                                    {
                                    this.state.username === null ? "Unknown" : "@" + this.state.username
                                }</p>
                            </div>
                            <div>
                                <Tabs id="controlled-tab-example "

                                    activeKey={
                                        this.state.activeTab
                                    }
                                    onSelect={
                                        (k) => this.setState({activeTab: k})
                                }>
                                    <Tab eventKey="1" title="User Posts"
                                        onEnter={
                                            () => {}
                                    }>
                                        {
                                        this.generateMyPostsCards(undefined)
                                    } </Tab>
                                    <Tab eventKey="2" title="Location Settings">
                                      <div>No location info for display</div>
                                    </Tab>
                                    <Tab eventKey="3" title="Achivements">
                                        <p>Helper Tab</p>
                                    </Tab>
                                </Tabs>
                            </div>
            </Col>
            <Col md="3"> <img className="change-cursor" src={msg} onClick={()=>{
                window.location.assign('/chat/'+this.state.id)
            }}></img></Col>
        </Row>
    </div>
    </div>)
}
}
export default ProfileNotFriend;