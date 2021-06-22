import React from 'react';

import {Row, Col, Container, Spinner} from 'reactstrap';
import {Tab, Nav, Tabs} from 'react-bootstrap';
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';
import Footer from '../Footer/Footer';
import {UncontrolledPopover, PopoverHeader, PopoverBody} from 'reactstrap';
import {uid} from 'uid';
import {ListGroup, ListGroupItem, Badge} from 'reactstrap';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatImg from '../../assets/chat.png';

import { InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import Notification from '../../assets/notification.wav';
import LawImg from '../../assets/law.png';
import Picker from 'emoji-picker-react';
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    FormText
} from 'reactstrap';
import online from '../../assets/online.png';
import offline from '../../assets/offline.png';
import profileIcon from '../../assets/profile.png';
import sendIcon from '../../assets/arrow.png';
import pop from '../../assets/pop.mp3';
import ctLogo from '../../assets/security.png';
import './General.css'
const io = require("socket.io-client");

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            headerId:null,
            message:"",
            username:"",
            online:null,
            showSpinnerInShowChat:false,
            showSpinnerInSideBar:false,
            chatListLoaded:0,
            emojiPickerOpen:false,
            key: null,
            chats: [],
            contor: 0,
            activeTab: null,
            socketConnected: false,
            connected: null,
            socket: null,
            typing: false,
            chatId: null,
            activeChat: null,
            currentChat: null,
            uid: null,
            showPopover: false,
            notificationBadge: 0,
            trigger: false,
            foundUsers: null,
            avatars: null,
            width:0,
            height:0,
            chatBoxHeight:null,
            chatListHeight:null,
            messageNotifications:null,
            searchInput:"",
            search:false,
            foundUsers:[]
        }
        this.lastMsgRef = React.createRef();
    }
    socket = io(api.backaddr);
    MINUTE_MS = 10000;
    updateDimensions = () => {
        console.log('width is : ', window.innerWidth)
        this.setState({ width: window.innerWidth, height: window.innerHeight});
      };
      componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
      }
    componentDidMount() {   
        /**
         * Sidebar height Calculations
         */
        let wrapperHeight = document.getElementById('new-sidebar-wrapper').clientHeight
        let tabMenu = document.getElementById('nav-fill').clientHeight
        let chatListHeight = wrapperHeight- tabMenu -50;
        let mainContainerHeigth = document.getElementById('main-container').clientHeight
        let chatBoxWrapper = (mainContainerHeigth * 85) /100
        this.setState({chatListHeight:chatListHeight, chatBoxWrapper:chatBoxWrapper})
        /**
         * END SIDEBAR CALC
         */
        window.addEventListener('resize', this.updateDimensions);
     
                
        let urlN = api.backaddr + '/api/notifications';
        let optionsN = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(urlN, optionsN).then(response => response.json()).then(response => {
            this.setState({
                notificationBadgeArray: response.notifications.rooms,
                trigger: !this.state.trigger
            })
        })

        this.socket.on('connection', (ata) => {
            this.setState({connected: true})
        });


        this.socket.on('push_notification', (obj) => {
            let audio = new Audio(Notification);
            audio.play()
           let room = obj.ruid;
            
            /**
             * fetch the chat only if this specific tab is open
             * if tab not open , increment bagde
             */
            /**
             * Play notification sound
             */
           
            if (this.state.activeChat !== null && this.state.activeChat.toString() === room.toString() && room.toString() !== null) {

                this.fetchTheChat(this.state.activeChat.toString())

            } else {
                let url = api.backaddr + api.authUser + api.routes.chatroomNotifications;
                let options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        token: localStorage.getItem("token").toString()
                    }
                };
                fetch(url, options).then(response => response.json()).then(response => {
                    this.setState({
                        messageNotifications: response.notificationsUpdate,
                        trigger: !this.state.trigger
                    })
                })

            }
        })

        this.socket.on('update', (data) => { // updating chat
            this.socket.emit('typing')
            this.fetchChat();
        });
       


    }
    /**
 * scroll to the bottom of the div WHEN UPDATED
 * Chat div 
 *  */
  

    componentWillMount() {
        let path = window.location.pathname;
        let id = path.split('/')[2]

        if (id === "all") {
            this.setState({key: "all"})
        }
        let url = api.backaddr + '/api/chat'
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options).then(response => response.json()).then((response) => {
            console.log('chat response ', response)
            var obj = [];
            response.chat.forEach(element => {
                let elementObj = {}
                elementObj.id = element.toString();
                elementObj.notification = 0;
                obj.push(elementObj)
            });
            let badgesArr = new Array(response.chat.length).fill(0);
            console.log("🚀 ~ file: Chat.jsx ~ line 195 ~ Chat ~ fetch ~ badgesArr", badgesArr)
            let loadingRet = response.ok ===1 ?1:0;
            console.log("RESPONSE NOW ", response.chat)
            this.setState({chats: response.chat, uid: response.uid, notificationBadge: obj, chatListLoaded:loadingRet, messageNotifications:response.notificationsQ})
        })
    }


   

    gen = (value) => {
        this.socket.emit('create_room', value)
        this.fetchTheChat(value)
    }

    fetchTheChat = async (id) => {
    console.log("🚀 ~ file: Chat.jsx ~ line 211 ~ Chat ~ fetchTheChat= ~ id", id)

       this.setState({showSpinnerInShowChat:true})
        let url = api.backaddr + '/api/room?id=' + id.toString();
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let resRaw = await fetch(url, options)
        let res = await resRaw.json()

        let urlQ = api.backaddr + api.authUser+ api.routes.clearChatMsgQueue + id.toString();
        let optionsQ = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
       let resQR = await fetch(urlQ, optionsQ)
       let resQ= await resQR.json()
       console.log("RESQ ", resQ)

        this.setState({activeChat: id, currentChat: res.chat, showSpinnerInShowChat:false, messageNotifications:resQ.notificationsUpdate})
    }

    /**
 * Message bubbles
 */
    executeScroll = () => this.lastMsgRef.current.scrollIntoView()




    sendMessage = async () => {
        if (this.state.message === "") {
            return
        }
        console.log('SEND ', this.state.currentChat)
        if (this.state.activeChat !== null && this.state.currentChat !== null) {
            let url = api.backaddr + '/api/sendMsg';
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                },
                body: JSON.stringify(
                    {ruid: this.state.activeChat.toString(), text: this.state.message}
                )
            };
            //
            let newChat = this.state.currentChat;
            let msgObj = {}
            msgObj.text = this.state.message;
            msgObj.from = this.state.uid.toString();
            msgObj.date = Date.now();
            msgObj._id = uid(24);
            newChat.push(msgObj)
            document.getElementById("msg-text-area").value = ""
            this.setState({currentChat: newChat, message:""})

            window.scrollTo(0, this.lastMsgRef.current !== null ? this.lastMsgRef.current.offsetTop : 0)
           
            let audio = new Audio(pop);
            audio.play();
            let ok = fetch(url, options).then(() => {
                this.socket.emit(this.state.activeChat.toString(), 'msg')
            }).catch(console.error())


        }

    }
    /**
 * In the contact tab
 * searchbox to open new chat
 */
componentDidUpdate(){
   console.log("UPDATE : ", this.lastMsgRef)
    if(this.lastMsgRef.current !== null && this.lastMsgRef.current !== undefined )
        {this.executeScroll()}
}
    handleSearchInput = (evt) => {
        let searchValue = document.getElementById("search-chat-box").value
        /**
     * id = search-input-box
     */
        if (evt.key === "Enter") {
            if (searchValue.length > 0 && searchValue !== undefined && searchValue !== null) {
                this.fetchSearch(searchValue)
            } else {
                alert("Search Box Empty")
            }
        }
    }


    
/**
 * 
 * @returns ******************************* NEW *******************
 */


/**
 * sidebar chats list items
 */

/**
 * 
 * @param {*} chatID 
 * @returns 
 */
clearChatNotifications = (id)=>{

        let url = api.backaddr + api.authUser+ api.routes.clearChatMsgQueue + id;
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        console.log("cleared ", url)
        fetch(url, options).then(response=>response.json()).then(response=>{
            console.log("CLEARQ ", response)
        })
}

/**
 * 
 * @param {the chat id provided from the newSideBar} chatID 
 * @returns number of notifications
 */
filterNotificationsBadge = (chatID)=>{
    if(this.state.messageNotifications !== null){

       let obj =  this.state.messageNotifications.filter(obj=>{
            return obj.roomId === chatID
        })
       console.log("🚀 ~ file: Chat.jsx ~ line 361 ~ Chat ~ obj", obj)

        if (obj.length===0){ return null;}

            if(obj[0].number === 0){return null}
        return obj[0].number;
    }
    return null;
}



    newGenerateChatList = (chats)=>{
        
if(chats !== null){
    /**
     * if search got no entries
     */
    if(chats.length === 0 && this.state.search){
        return(
            <ListGroupItem className="background">
               <span>Search returned no results</span> 
            </ListGroupItem>

        )
    }
    let i =0;
    return chats.map(chat=>{
        i++;
        return(<ListGroupItem  style={{borderColor:'var(--text-color)',padding:'10px', marginTop:i==1?'0px':'10px', minHeight:'50px', backgroundColor:this.state.activeChat===chat.chat?'#00adb5':'transparent'}} className="change-cursor" onClick={()=>{this.setState({activeChat:chat.chat, username:chat.username, online:chat.online, headerId:chat.id})
       console.log("CHAT IS : ", chat)
        this.fetchTheChat(chat.chat);
        }}>
            
           <div  style={{}}>
               <img className="float-left" style={{width:'32px', height:'32px', borderRadius:'50%'}} src={api.cdn+api.avatarMedia.p128+chat.avatar}></img>
           {chat.isAdmin&& <img  className="float-left" style={{width:'32px', height:'32px', borderRadius:'50%'}} src={LawImg} title="Authorities"></img>}
           &nbsp;<span>{chat.username}</span>
           &nbsp;
           <img className="icon-xsmall" style={{border:'solid', borderColor:'black', borderWidth:'1px', borderRadius:'50%'}} src={chat.online?online:offline} title={chat.online?"online":"offline"}></img>
           &nbsp;
           <Badge id={chat.chat}>
               {
               this.filterNotificationsBadge(chat.chat)
               }
           </Badge> 
           </div>
        </ListGroupItem>)
    })
}
    }



    newSideBarList = (chats)=>{
        //need to compute list height
        if(chats === 0 && this.state.chatListLoaded ===1){
            return(<div>
                <p>You don't have any open chats</p>
            </div>)
        }

        if(chats === 0 && this.state.chatListLoaded ===0){
            return(<Spinner style={{marginTop:'30px'}}/>)
        }
      
        return(<div style={{height:this.state.chatListHeight!==null?this.state.chatListHeight:'0px', marginTop:'20px', overflowY:'scroll'}} className="sidebar-list-wrapper">
            <ListGroup style={{paddingTop:'20px', paddingBottom:'20px'}}>
               {this.newGenerateChatList(chats)}
               </ListGroup>
        </div>)
    }


    handleChatSearch = (evt)=>{
        if(evt.target.value.length > 3){
            let searchChats =  this.state.chats.filter(obj=>{
                return obj.username.includes(evt.target.value)
            })
            console.log("SEarch chats are : ", searchChats)
            this.setState({searchInput:evt.target.value, search:true, foundUsers:searchChats})
            //search
        }else {
            this.setState({search:false})
        }
    }

/**
 * 
 * @returns the sidebar chat list
 */

    newSideBar = ()=>{
        if(this.state.search){
            return(
                <div id="new-sidebar-wrapper" >
                    <div id="nav-fill" style={{padding:'10px'}}>
                    <img src={ctLogo} style={{width:'36px', height:'36px'}}></img>&nbsp;
                    <span>ctChat</span>
                    <br></br>
                      <div style={{marginTop:'20px'}}>
                           
                            <InputGroup>
                                <InputGroupAddon addonType="append" className="background">
                            <InputGroupText className="background"><span style={{color:'black !important'}}>@</span></InputGroupText>
                            </InputGroupAddon>
                            <Input placeholder="Search by username" onChange={(evt)=>{
                                this.handleChatSearch(evt)
                            }} />   
                        </InputGroup>
                         </div>
                    </div>
                   <div style={{height:'100%'}}>
                      {this.newSideBarList(this.state.foundUsers)}
                   </div>
                </div>
            )
            
        }
        return(
            <div id="new-sidebar-wrapper" >
                <div id="nav-fill" style={{padding:'10px'}}>
                <img src={ctLogo} style={{width:'36px', height:'36px'}}></img>&nbsp;<span>ctChat</span>
                <br></br>
                  <div style={{marginTop:'20px'}}>
                       
                        <InputGroup>
                            <InputGroupAddon addonType="append" className="background">
                        <InputGroupText className="background"><span style={{color:'black !important'}}>@</span></InputGroupText>
                        </InputGroupAddon>
                        <Input placeholder="Search by username" onChange={(evt)=>{
                            this.handleChatSearch(evt)
                        }} />   
                    </InputGroup>
                     </div>
                </div>
               <div style={{height:'100%'}}>
                  {this.newSideBarList(this.state.chats)}
               </div>
            </div>
        )
    }
    
newShowChat = ()=>{
    
    if(this.state.showSpinnerInShowChat === true){
        return(<div className="new-chat-box">
          <div>
            <Spinner/>
          </div>
        </div>)
     }


    if(this.state.activeChat === null){
       return(<div className="new-chat-box">
         <div>
           <p className="text-header2">Click on user entry to open an active chat</p> 
           <img style={{width:'48px', height:'48px'}} src={ChatImg}></img>
         </div>
       </div>)
    }
    if(this.state.currentChat !== null && this.state.currentChat.length === 0){
        return(<div className="new-chat-box">
          <div>
            <p className="text-header2">You don't have any messages with the currently selected user.</p> 
            <img src={ChatImg} style={{width:'48px', height:'48px'}}></img>
            <div style={{left:'0px',bottom:"10px", position:'absolute', width:'100%'}} autoComplete="none">
            
              <input name="chat-message-area" id="msg-text-area" type="text" style={{width:'80%', borderRadius:'20px'}} 
              autocomplete='off'
              value={this.state.message}
              onChange = {evt=>{this.setState({message:evt.target.value})}}
              onKeyDown={evt=>{
                  if(evt.key === "Enter"){
                      this.sendMessage()
                  }
              }}></input>
            
             <span className="" onClick={()=>{this.setState({emojiPickerOpen:!this.state.emojiPickerOpen})}}> <EmojiPicker id="emoji" open={this.state.emojiPickerOpen} style={{ position: 'absolute', bottom:'0px !important' }}/> </span>
              &nbsp;
              <img className="change-cursor" style={{width:'30px', height:'35px', paddingBottom:'6px', right:0}} src={sendIcon} onClick={this.sendMessage}></img>
           </div>
          </div>
        </div>)
     }
console.log("THIS ISTAT CURRENT ", this.state.activeChat)
if(this.state.currentChat !== null){
    return(
<div id="chat-box-wrapper" className="new-chat-box" id="maybe-me" style={{overflowY:'scroll'}}>
    
         <div className="" id="chat-wrap" style={{width:'100%', height:'100%', overflowY:'scroll', position:'relative'}}>
         <div className="chat-header" style={{}}>

            <span className="chat-user-header-left "  >{this.state.username} &nbsp;<img className="icon-xsmall" title={this.state.online?"online":"offline"}src={this.state.online?online:offline}></img></span>
            <span className="chat-user-header-right ">
                <a href={'/user/'+this.state.headerId}>
                <img className="icon-small change-cursor" src={profileIcon} title={"View "+ this.state.username+"'s profile"}
            onClick={()=>{
            }}
            ></img>
            </a>
            </span>
         </div>

           <div 
           className=""
           id="chat-box-dialog"
           style={{
               padding:'10px',
               height:this.state.chatBoxWrapper!==null?this.state.chatBoxWrapper +'px':0,
               overflowY:'scroll',
               lineBreak:'normal'
           }}>
               
              {
                  
                this.state.currentChat.map((msg)=>{
                    let background = 1; 
                    background = msg.from === this.state.uid?1:0;
                   
                    return(
                        <div
                        ref={this.lastMsgRef}
                        >
                        <Row>
                            <Col lg="auto">{background === 0?this.MessageBubble(msg, background):null}</Col>
                            <Col></Col>
                            <Col lg="auto">{background === 1?this.MessageBubble(msg, background):null}</Col>
                    </Row>
                    </div>
                    )
                })
              }
           </div>

           <div style={{left:'0px',bottom:"10px", position:'absolute', width:'100%'}}>
              <input id="msg-text-area" type="text" style={{width:'80%', borderRadius:'20px'}}
              autoComplete="off"
              
              value={this.state.message}
              onChange = {evt=>{this.setState({message:evt.target.value})}}
              onKeyDown={evt=>{
                  if(evt.key === "Enter"){
                      this.sendMessage()
                  }
              }}></input>
             <span className="" onClick={()=>{this.setState({emojiPickerOpen:!this.state.emojiPickerOpen})}}> <EmojiPicker open={this.state.emojiPickerOpen} onBlur={()=>{this.setState({emojiPickerOpen:false, update:true})}}/></span>
              &nbsp;
              <img className="change-cursor" style={{width:'30px', height:'35px', paddingBottom:'6px', right:0}} src={sendIcon} onClick={this.sendMessage}></img>
           </div>
         </div>
    
       </div>
    )
}

return (<Spinner/>)
}


 MessageBubble = (msg, back)=>{
    return(
        <div 
        className="pull-left"
        
        key={msg._id.toString()}
        id={msg._id.toString()}
        style={{
            backgroundColor:back===1?"#08d9d6":"grey",
            borderRadius:'20px',
            padding:"15px",
            maxWidth:'20vw',
            whiteSpace:'pre-line',
            wordBreak:'break-word',
            marginTop:'15px',
            textAlign:'left'
        }}>
           <span>{msg.text}</span> </div>
       
    )
}

    render() {
        console.log("THIS USERNAME : ", this.state.username, " ONLINE : ", this.state.online)
        if (this.state.chats !== null && this.state.uid) {
            this.socket.emit('join_push_notifications', this.state.uid)
            console.log('Joined push notification room : ', this.state.uid)
        }

        return (
            <div className="background">
                <NavBar/>
                <div style={{paddingBottom:'10px'}}>
                <Container 
                id="main-container"
                className="background-component"
                style={
                    {
                        minHeight: '90vh',
                        marginTop: '2vh',
                        backgroundColor:'white',
                        padding:'2px',
                        borderRadius:'20px'
                    }
                }>
                 <Row 
                 className=""
                 style={{ 
                     padding:'25px',
                     minHeight:'inherit'
                 }}>
                  <Col xs="12" sm="12" md="12" lg="3" xl="3" className="">{this.newSideBar()}</Col>
                    
                     <Col xs="12" sm="12" md="12" lg="9" xl="9" className="">{this.newShowChat()}</Col>
                 </Row>
                </Container>
                </div>
            </div>
        )
    }
}


const EmojiPicker = (open)=>{

    if(open.open){
    return(
        <span>
        <span>
        😃
    </span>
    <span style={{position:'absolute', bottom:'0'}}>
<Picker onEmojiClick={(ev, em)=>{ 
    document.getElementById("msg-text-area").value+=em.emoji
   
    }} 
    onBlur={()=>{
        open.open= false
    }}
    />
    </span>
    </span>)
    }

    else{
        return(
            <span className="change-cursor">
                😃
            </span>
        )
    }
}




export default Chat;
