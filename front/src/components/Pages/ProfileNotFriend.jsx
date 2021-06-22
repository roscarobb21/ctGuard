import React, {useEffect, useState} from 'react';
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';
import {Container, Row, Col} from 'reactstrap';
import {Card, CardBody, CardFooter, CardTitle, Progress, FormGroup, Label, Input} from 'reactstrap';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {Spinner} from 'reactstrap';

import Footer from '../Footer/Footer';

import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import PostItem from '../PostItem/PostItem';
import Showcase from '../Achivements/Showcase';

import Skeleton from 'react-loading-skeleton';

import online from '../../assets/online.png';
import offline from '../../assets/offline.png';
import myPostsImg from '../../assets/myposts.png';
import locationImg from '../../assets/locationImg.png';
import achivementsImg from '../../assets/objective.png';
import contactsImg from '../../assets/contacts.png';

class ProfileNotFriend extends React.Component{
constructor(props)
{
    super(props)
    this.state={
        id:null,
        username:null, 
        posts:null,
        follow:null,
        law:null,
        user:null,
        replaceChatIcon:false,
        errMsg:""
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
        let url = api.backaddr+'/api/user?id='+this.state.id;
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
        if(response.ok === 1){
            console.log("🚀 ~ file: ProfileNotFriend.jsx ~ line 55 ~ ProfileNotFriend ~ componentDidMount ~ response", response)
            
            this.setState({user:response.user})
            
        }else {
            window.location.assign('/profile')
        }
}
}

newGenerateMyPostsCards = (posts) => {

    if (this.state.user.posts === null || this.state.user.posts.length === 0) {
        return (
            <div className="background-component" style={{display:'flex', minHeight:'350px', width:'100%', borderRadius:'20px', marginTop:'20px', marginBottom:'20px'}}>
                <p className="align-self-center text-header2 " style={{marginLeft:'auto', marginRight:'auto'}}>User didn't post anything yet</p>
            </div>
        )
    }
    console.log("NEW GENERATE ", posts)
    return(this.state.user.posts.map(post => {
        console.log("POST MAPPED NOW IS ", post)
        return (
            <PostItem post={post}/>
        )
    }))

}

openChat=()=>{
    this.setState({replaceChatIcon:true})
    let url= api.backaddr + api.authUser + api.routes.chat + this.state.id;
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
     if(response.ok === 1){
         window.location.assign('/chat/all')
     }else {
         this.setState({replaceChatIcon:false, errMsg:"Unable to open chat, try again later"})
     }
  })

}




render(){
    if(this.state.id === null){
        return(<p>null</p>)
    }
    if(this.state.user === null){
        return(
            <div className="background" style={{minHeight:'100vh'}}>
                    <NavBar/>
                    <Row>
                <Col md="0" lg="3"></Col>
                <Col md="12" lg="6" className="profile-container">
                    <div style={
                        {
                            
                            padding: '30px 0px 20px 0px',
                            borderRadius: '20px'
                        }
                    }
                    className="background-component profile-container"
                    >
                        <Row>
                            <Col className="" xs="12" md="12" lg="12" xl="4">
                        <div className="float-md-none float-lg-none float-xl-left ml-lg-4">
                            <div style={{position:'relative'}}>
                            <img src={
                                       api.cdn+api.avatarMedia.p1080+"default.jpg" 
                                    }
                                    className="profile-img-stranger"
                                    onClick={
                                        this.handleModal
                                }></img>
                                
                                </div>
                                <p className="text-header2"><Skeleton className="skeleton-theme" height={20} count={1} /></p>
                                <br></br>
                                </div>
                        </Col>
                        <Col className=""   xs="12" md="12" lg="12" xl="8"  style={{padding:'0px 50px 0px 50px'}}>
                        <div className="float-xs-none float-sm-none float-md-none float-lg-none float-xl-left background-component-level-1" style={{backgroundColor:'white', borderRadius:'20px', minHeight:"150px", textAlign:'left', minWidth:'100%', padding:'20px', maxHeight:'250px', overflow:'scroll'}}>
                       <div style={{textAlign:'left'}}>
                                    <Skeleton className="skeleton-theme" height={15} count={3}/>
                      </div>
                        </div>
                        </Col>
                        </Row>
                        <div id="profile-showcase" className="">
                        <Row style={{marginTop:'10px'}}>
                                        <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                        <Col xs="12" sm="12" md="4" lg="4" xl="4">
                           <Spinner/>
                            </Col>
                                    <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                    </Row>
                        </div>
                    </div>
                    </Col>
                    <Col md="0" lg="3"></Col>
                    </Row>
        
            </div>
        )
    }
    return(
        <div className="profile background">

        <NavBar/>
        <div>
            <Row>
                <Col md="0" lg="3"></Col>
                <Col md="12" lg="6" className="profile-container">
                    <div style={
                        {
                            
                            padding: '30px 0px 20px 0px',
                            borderRadius: '20px'
                        }
                    }
                    className="background-component"
                    >
                        <Row>
                            <Col className="" xs="12" md="12" lg="12" xl="4">
                        <div className="float-md-none float-lg-none float-xl-left ml-lg-4">
                            <div style={{position:'relative'}}>
                            <img src={
                                        this.state.user.avatarUrl === null ? api.cdn+api.avatarMedia.p1080+"default.jpg" : api.cdn + api.avatarMedia.p1080 + this.state.user.avatarUrl
                                    }
                                    className="profile-img-stranger"
                                    title={this.state.user.username}
                                    onClick={
                                        this.handleModal
                                }></img>
                                
                                </div>
                                <p className="text-header2">@{this.state.user.username}&nbsp;<img className="icon-xsmall" src={this.state.user.online?online:offline} title={this.state.user.online?"online":"offline"}></img></p>
                                <br></br>
                                </div>
                        </Col>
                        <Col className=""   xs="12" md="12" lg="12" xl="8"  style={{padding:'0px 50px 0px 50px'}}>
                        <div className="float-xs-none float-sm-none float-md-none float-lg-none float-xl-left background-component-level-1" style={{backgroundColor:'white', borderRadius:'20px', minHeight:"150px", textAlign:'left', minWidth:'100%', padding:'20px', maxHeight:'250px', overflow:'scroll'}}>
                       <div style={{textAlign:'left'}}>
                           {this.state.user.bio.length === 0 ? <span>This user has no bio</span>:<span>{this.state.user.bio}</span>}
                      </div>
                        </div>
                        </Col>
                        </Row>
                        <div id="profile-showcase" className="">
                        <Row style={{marginTop:'10px'}}>
                                        <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                        <Col xs="12" sm="12" md="4" lg="4" xl="4">
                            <Showcase showcase={this.state.user.showcase} />
                            </Col>
                                    <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                    </Row>
                        </div>
                    </div>

                    <div style={
                        {paddingTop: '20px'}
                    }>
                        <Tabs fill id="controlled-tab-example "

                            activeKey={
                                this.state.activeTab
                            }
                            onSelect={
                                (k) => this.setState({activeTab: k})
                        }>
                            <Tab eventKey="1" title={
                                <span><img src={myPostsImg} className="img-tab"></img>&nbsp;User posts</span>
                            }
                                onEnter={
                                    () => {}
                            }>
                                <div style={{minHeight:'350px'}}>
                                {
                                this.state.user.posts && this.newGenerateMyPostsCards(this.state.user.posts)
                            }
                            </div>
                             </Tab>
                            <Tab eventKey="2" title={
                                <span>
                                <img src={locationImg} className="img-tab"></img>&nbsp;User Location
                            </span>
                            }>
                               <div className="justify-content-center background-component" style={{display:'flex', minHeight:'350px', borderRadius:'20px', marginTop:'30px', marginBottom:'30px'}}>
                                        <span className="text-header2 align-self-center" style={{margin:'auto'}}>Location information <span style={{color:'#ff2e63 !important'}}>private</span></span>
                               </div>
                            </Tab>
                            <Tab eventKey="3" title={
                                 <span><img src={achivementsImg} className="img-tab"></img>&nbsp;Achivements</span>
                            }>
                                <div style={{marginBottom:'20px'}}>
                                   <Achivements id={this.state.user._id} postPoints={this.state.user.postPoints} username={this.state.user.username}/>
                                    </div>
                            </Tab>
                            <Tab eventKey="4" title={
                                <span><img src={contactsImg} className="img-tab"></img>&nbsp;Contact</span>
                            }>
                                
                                <div className="" style={{minHeight:'300px', marginTop:'20px'}}>
                                <Row>
                                    <Col>
                                    {!this.state.user.anon &&
                                    <div className="justify-content-center background-component" style={{display:'flex', minHeight:'350px', backgroundColor:'white', borderRadius:'20px', padding:'25px'}}>
                                         <FormGroup>
                                        <Label for="firstname" className="float-left"><span>First Name:</span></Label>
                                        <Input disabled type="text" name="firstname" id="first" value={this.state.user.firstName} />
                                        <br></br>
                                        <Label for="lastname" className="float-left"><span>Last Name:</span></Label>
                                        <Input disabled type="text" name="lastname" id="last" value={this.state.user.lastName} />
                                        <br></br>
                                        <Label for="email" className="float-left"><span>Email:</span></Label>
                                        <Input disabled type="text" name="email" id="email" value={this.state.user.email} />
                                        <br></br>
                                        {this.state.user.isAdmin &&
                                        <div>
                                        <Label for="function" className="float-left">Function:</Label>
                                        <Input disabled type="text" name="function" id="function" value={this.state.user.functionTxt} />
                                        </div>
                                        }
                                        </FormGroup>
                               </div>}
                                    {this.state.user.anon &&
                                    <div className="justify-content-center background-component" style={{display:'flex', minHeight:'350px', backgroundColor:'white', borderRadius:'20px'}}>
                                        <p className="text-header2 align-self-center" style={{margin:'auto'}}>User is <span style={{color:'#ff2e63'}}>anonimous</span></p>
                               </div>}
                               </Col>
                               <Col>
                               <div className="float-right change-cursor background-component" style={{ backgroundColor:'white', borderRadius:'20px', padding:'10px', width:'100%', height:'100px'}} onClick={this.openChat}>
                                   <p>Open chat with user</p>
                              {!this.state.replaceChatIcon && <ChatBubbleOutlineOutlinedIcon />}
                              {this.state.replaceChatIcon && <Spinner/>}
                               </div>
                              <div>
                                 &nbsp;
                              </div>
                              {!this.state.user.anon && 
                               <div className="change-cursor background-component" style={{marginBottom:'0px', backgroundColor:'white', borderRadius:'20px', padding:'10px', width:'100%', height:'100px'}} onClick={()=>{
                                       /**
                                        * TODO SET EMAIL IN USER
                                        */
                                       window.open('mailto:'+ this.state.user.email)
                                   }}>
                                   <p>Send Email to user</p>
                                   <EmailOutlinedIcon  />
                               </div>
                               }
                               </Col>
                               </Row>
                               </div>
                                </Tab>
                        </Tabs>
                    </div>

                </Col>
                <Col md="0" lg="3"></Col>
            </Row>
        </div>
        <div>
            <Footer/>
        </div>
    </div>
    
    )
}
}



let Achivements = (props)=>{
console.log("🚀 ~ file: ProfileNotFriend.jsx ~ line 244 ~ Achivements ~ props", props)
    const [postPoints, setPostPoints]= useState(props.postPoints);
    const [username, setUsername] = useState(props.username);
    const [uid, setUid] = useState(props.id);
    const [achivements, setAchivements] = useState(null);

    
    /*
    fetch user achivements
    */
   useEffect( async ()=>{
       if(achivements === null){
    let url = api.backaddr + api.authUser + '/userAchiv?id='+uid;
    let options = {
     method: "GET",
     headers: {
         "Content-Type": "application/json",
         "Cache-Control": "no-cache, no-store, must-revalidate",
         Pragma: "no-cache",
         token: localStorage.getItem("token").toString()
      }
     };  
     const responseRaw = await fetch(url, options);
     const response = await responseRaw.json();
     console.log("🚀 ~ file: ProfileNotFriend.jsx ~ line 267 ~ useEffect ~ response", response)
     setAchivements(response.achivements)
    }
   })
  

    return(
        <div>
        <div className="background-component" style={{marginTop:'2vh', borderRadius:'20px', padding:'20px'}}>
            <p className="text-header2">@{username}'s postPoints : {postPoints}</p>
        </div>
        <AchivMap points={postPoints} allAchivements={achivements}/>
   
        </div>
    )
}

let AchivMap = (props)=>{
    let all = props.allAchivements;
    let points = props.points;
  
    if(all !== null){
    return all.map(element=>{
        return <Achivement element={element} points={points}/>
    })
        }
        return(<Spinner/>)
}


let Achivement = (props)=>{
console.log(" ACHIVEMENTS PROPS : ", props);
let achiv = props.element;
let my = props.my;
let points = props.points;
let progress;

if(achiv.points === 0 || points >= achiv.points){
    progress = 100;
}else {
    progress = points * 100 /achiv.points;
}

if(isNaN(progress)){
    progress = 100;
}

let text = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
let color = ["primary", "primary", "info", "info", "info", "warning", "warning", "warning", "success", "success"];
var quotient = Math.floor(progress/10) - 1;


console.log("🚀 ~ file: ProfileNotFriend.jsx ~ line 350 ~ Achivement ~ progress", progress)
if(achiv !== null && my !== null){
return(<div className="background-component" style={{padding:'30px', marginTop:'2vh', borderRadius:'20px'}}>
    <Row className="align-items-center">
        <Col sm="12" md="12" lg="4" xl="4">
        <img src={api.cdn+'/'+achiv.media[0]} style={{width:'150px', height:'150px', borderRadius:'20px'}} className="align-items-center"></img>
        </Col>
        <Col sm="12" md="12" lg="8" xl="8">
        <p className="text-header2 align-items-center" style={{padding:'20px'}}>{achiv.name}</p>
        <p className="text-muted">{achiv.description}</p>
        </Col>
    </Row>
    <Row style={{marginTop:'1vh'}}>
        <Col>
        <Progress animated color={color[quotient]} value={progress}> </Progress>
        </Col>
    </Row>
    </div>
    )
}
return(<Spinner/>)
}



export default ProfileNotFriend;








/**
 * 
 *  <div id="profile-img-wrapper" className=""
                            style={
                                {position: 'relative', textAlign:'right'}
                        }>
                            <div>
                                <img src={
                                        this.state.user.avatarUrl === null ? api.cdn+api.avatarMedia.p1080+"default.jpg" : api.cdn + api.avatarMedia.p1080 + this.state.user.avatarUrl
                                    }
                                    className="profile-img-stranger"
                                    title={this.state.user.username}
                                    onClick={
                                        this.handleModal
                                }></img>
                            </div>
                            <div style={
                                {}
                            }></div>
                        </div>
                        <p className="text-header1" style={{textAlign:'right'}}>
                            {
                            this.state.user.username === null ? "Unknown" : "@" + this.state.user.username
                        }</p>
 */

                        //
                        //<div style={{position:'absolute', bottom:'0', right:'0'}}><img className="" style={{width:'16px', height:'16px'}} src={this.state.user.online?online:offline}></img></div>