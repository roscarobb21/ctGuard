import React from 'react';

import {Row, Col, Container, Spinner} from 'reactstrap';
import {Tab, Nav, Tabs} from 'react-bootstrap';
import { ChatFeed, Message, BubbleGroup } from 'react-chat-ui'
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';
import {UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import { uid } from 'uid';
import { ListGroup, ListGroupItem , Badge} from 'reactstrap';

import ChatImg from '../../assets/chat.svg'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import './General.css'
const io = require("socket.io-client");

class Chat extends React.Component{
    constructor(props){
        super(props)
        this.state={
            key:null,
            chats:[],
            contor:0,
            activeTab:null,
            socketConnected:false,
            connected:null,
            socket:null,
            typing:false,
            chatId:null,
            activeChat:null,
            currentChat:null, 
            uid:null,
            showPopover:false,
            notificationBadge:0,
            trigger:false,
            foundUsers:null,
            avatars:null,
        }  
        this.lastMsgRef = React.createRef();
    }
    socket = io(api);
    MINUTE_MS = 10000;
componentDidMount(){
    const interval = setInterval(() => {
        if(this.state.activeChat!== null){
            //clear queue every 15s
            let url = api+'/api/clearQueue?id='+this.state.activeChat;
                    let options = {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            token: localStorage.getItem("token").toString()
                        }
                    };
                    console.log("cleared")
                    fetch(url, options).then(response=>response.json()).then(response=>{
                        this.setState({notificationBadge:response.newNotifications})
                    })
                }else {
                    console.log("Nothing to clear")
                }
      }, this.MINUTE_MS );
      let url = api+'/api/notifications';
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
          console.log('notifications fetched ', response)
          this.setState({notificationBadge:response.notifications.rooms, trigger:!this.state.trigger})
      })

        this.socket.on('connection', (ata) => {
            this.setState({  connected: true })
        });
        this.socket.on('push_notification', (room)=>{
            /**
             * fetch the chat only if this specific tab is open
             * if tab not open , increment bagde
             */
            if(this.state.activeChat!==null && this.state.activeChat.toString()===room.toString() && room.toString()!== null){
            
            this.fetchTheChat(this.state.activeChat.toString())
            
            }else {
                let url = api+'/api/notifications';
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
                    this.setState({notificationBadge:response.notifications.rooms, trigger:!this.state.trigger})
                })
                
            }
        })

        this.socket.on('update', (data) => {
            //updating chat
            this.socket.emit('typing')
            this.fetchChat();
        });
        //this.state.currentChat!==null?this.lastMsgRef.current.scrollIntoView({smooth:true}):null
        

}
/**
 * scroll to the bottom of the div WHEN UPDATED
 * Chat div 
 *  */ 
componentDidUpdate() {
    // I was not using an li but may work to keep your div scrolled to the bottom as li's are getting pushed to the div
    const objDiv = document.getElementById('chat-container');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

    componentWillMount(){
        let path = window.location.pathname;
        let id = path.split('/')[2]
        if (id !== undefined && id !== null && id.toString() !== "all") {
            let newId = id.split('_').join(' ')
            let url = api + '/api/chat?id='+id
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
            this.setState({key: newId})
        }
               
        if(id === "all"){
            this.setState({key:"all"})
        }
        let url = api + '/api/chat'
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options).then(response=>response.json()).then((response)=>{
            console.log('chat response ', response)
            var obj=[];
            response.chat.forEach(element => {
                let elementObj={}
                elementObj.id=element.toString();
                elementObj.notification=0;
                obj.push(elementObj)
            });
            console.log("the chats i got : ", response.chat)
                this.setState({chats:response.chat, uid:response.uid, notificationBadge:obj, avatars:response.avatars})
        })
    }




generateSideBar=()=>{
if(this.state.chats !== null ){
    return(
        <div className="overflow-auto" style={{overflowY:'scroll', height:'66%'}}>
        <ListGroup >
            {
            this.state.chats.map(element=>{
                let notifications_number=0;
                if(this.state.notificationBadge.length>0){
                this.state.notificationBadge.forEach(el => {
                    if(el.roomId===element){
                        notifications_number= el.number
                    }
                });
            }
                return(<ListGroupItem className="change-cursor" color={this.state.activeChat===element.chat.toString()?"primary":''} style={{marginTop:'2vh'}} onClick={()=>{
                    this.gen(element.chat.toString())
                    let url = api+'/api/clearQueue?id='+element.chat.toString();
                    let options = {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            token: localStorage.getItem("token").toString()
                        }
                    };
                    /*
                    fetch(url, options).then(response=>response.json()).then(response=>{
                        console.log("FETCH?")
                        this.setState({notificationBadge:response.newNotifications})
                    })*/
                   this.setState({activeChat:element.chat.toString()})
                }}>
                   <span className="chat-sidebar-element"><img className="chat-sidebar-avatar" src={element.avatar}></img> <span>{element.chat} </span><Badge id={element} color="primary">{notifications_number!==0?notifications_number:null}</Badge></span>
                </ListGroupItem>)
            })
       
            }
  </ListGroup>
  </div>
    )
}
return null;
}

gen=(value)=>{
    this.socket.emit('create_room', value)
    this.fetchTheChat(value)
}

 fetchTheChat= async (id)=>{
let url = api + '/api/room?id='+id.toString();
let options = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        token: localStorage.getItem("token").toString()
    }
};
let resRaw= await fetch(url, options)
let res= await resRaw.json()
console.log("REPSONSE ", res)
this.setState({activeChat:id, currentChat:res.chat})
}

/**
 * Message bubbles
 */
 executeScroll = () => this.lastMsgRef.current.scrollIntoView() 

showChat=()=>{
 if(this.state.currentChat!== null){
     console.log('this.state.currentChat ', this.state.activeChat)
     let messageArray = this.state.currentChat.messages
    return messageArray.map((message,i,messageArray)=>{
        if(messageArray.length-1===i){
            return(<div className="">
            {message.from===this.state.uid?
            <div className="text-right"><Button color="primary" ref={this.lastMsgRef} id={message._id.toString()} style={{marginTop:'1vh'}}  onClick={()=>{this.setState({showPopover:!this.state.showPopover})}}>{message.text}  {this.state.showPopover?<Badge for={message._id.toString()}>{message.date}</Badge>:null}</Button></div>:
            <div className="text-left"><Button color="secondary" ref={this.lastMsgRef} style={{marginTop:'1vh'}}>{message.text}</Button></div>}
        </div>)
        }
        return(<div className="">
            {message.from===this.state.uid?
            <div className="text-right"><Button color="primary" id={message._id.toString()} style={{marginTop:'1vh'}}  onClick={()=>{this.setState({showPopover:!this.state.showPopover})}}>{message.text}  {this.state.showPopover?<Badge for={message._id.toString()}>{message.date}</Badge>:null}</Button></div>:
            <div className="text-left"><Button color="secondary" style={{marginTop:'1vh'}}>{message.text}</Button></div>}
        </div>)
    })
 }
}


 sendMessage= async ()=>{
     if(document.getElementById("msg-text-area").value.toString() === ""){
         return
     }
     console.log('SEND ', this.state.currentChat)
    if(this.state.activeChat!==null && this.state.currentChat!==null){
        let url = api + '/api/sendMsg';
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            },
            body: JSON.stringify({
                ruid:this.state.activeChat.toString(),
                text:document.getElementById("msg-text-area").value.toString()
            })
        }; 
        //
        let newChat = this.state.currentChat;
        let msgObj={}
        msgObj.text= document.getElementById("msg-text-area").value.toString();
        msgObj.from= this.state.uid.toString();
        msgObj.date= Date.now();
        msgObj._id=uid(24);
        newChat.messages.push(msgObj)
        document.getElementById("msg-text-area").value=""
        this.setState({currentChat:newChat})

        window.scrollTo(0, this.lastMsgRef.current!==null?this.lastMsgRef.current.offsetTop:0)   
      
        let ok = fetch(url, options).then(()=>{
            this.socket.emit(this.state.activeChat.toString(), 'msg')
        })
        .catch(console.error())
       
        
       
        
    }

}
/**
 * In the contact tab
 * searchbox to open new chat
 */
handleSearchInput=(evt)=>{
    let searchValue = document.getElementById("search-chat-box").value
    /**
     * id = search-input-box
     */
    if(evt.key === "Enter"){
        if(searchValue.length>0 && searchValue !== undefined && searchValue !== null){
           this.fetchSearch(searchValue)
        }else {
            alert("Search Box Empty")
        }
    }
}
/**
 * 
 * @param {*} value 
 */
generateSearchContactBox =()=>{
    this.state.foundUsers.map(user=>{
        console.log('FOUND GENERATE ', user)
        return(
            <div className="helper">
                <p>HOKEY</p>
            </div>
        )
    })
}

fetchSearch = (value) => { /**
    * Fetch user search
    */
   console.log('fetch de ', value)
   let url = api + '/api/search?seed='+value;
   let options = {
       method: "GET",
       headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache, no-store, must-revalidate",
           Pragma: "no-cache",
           token: localStorage.getItem("token").toString()
       }
   };
   fetch(url, options).then(response=>response.json()).then((response)=>{
       console.log('FETCH SEARCH RESPONSE : ', response.user)
       this.setState({foundUsers:response.user})
   })
}


    render(){
        if(this.state.chats!== null && this.state.uid){
            this.socket.emit('join_push_notifications', this.state.uid)
            console.log('Joined push notification room : ', this.state.uid)
        }
       
        return(<div>
            <NavBar/>
            <Container className="helper" style={{}}>
            <Row  style={{marginTop:'2vh'}}>
                
                <Col className="float-left" md="4" >
                <Tabs defaultActiveKey="active" id="uncontrolled-tab-example">
                <Tab eventKey="active" title="Active Chats">
                {this.state.chats!==null?this.state.chats.length>0?this.generateSideBar():<p>You don't have any open chats</p>:<Spinner/>}
  </Tab>
  <Tab eventKey="contact" title="Contact">
  <FormGroup>
                                <Label>Search for someone</Label>
        <Input
          type="search"
          name="search"
          id="search-chat-box"
          placeholder="Press Enter to search"
          onKeyPress={(evt)=>{
            this.handleSearchInput(evt)
        }} style={{visibility:window.location.pathname.split('/')[1]==="search"?'hidden':''}}

        />
      </FormGroup>
      <div>
          {this.state.foundUsers===null?"unknown":this.generateSearchContactBox()}
      </div>
  </Tab>
</Tabs>
                   
                </Col>
                <Col className="float-right" md="8">
                <div id="chat-container" style={{height:'600px', overflowY:'auto'}}>   
{this.state.currentChat!== null?this.showChat():<div style={{paddingTop:'33%', }}><p className="text-header2">Click on a chat room to open a chat</p><img src={ChatImg}></img></div>}
</div>

                </Col>
                <Col md="2"></Col>
            </Row>
            <Row className="">
                <Col sm="0" md="4"></Col>
                <Col sm="12" md="8">
                <FormGroup>
        <Label for="exampleText"></Label>
        <Input style={{display:this.state.activeChat?'':'none'}} type="textarea" name="text" id="msg-text-area" />
      </FormGroup>
                </Col>       
            </Row>
            <Row className="">
                <Col></Col>
               <Col className=""> </Col>
                <Col className="justify-content-end" style={{textAlign:'right'}}><Button style={{display:this.state.activeChat?'':'none'}} color="primary" onClick={this.sendMessage}>send</Button></Col>
            </Row>
            </Container>
        </div>)
    }
}

export default Chat;

/**
 * 
 *   <Row>
                <Col></Col>
                <Col md="12">
                <FormGroup>
        <Label for="exampleText">Text Area</Label>
        <Input type="textarea" name="text" id="msg-text-area" />
      </FormGroup>
                </Col>       
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
               <Col> <Button color="primary" onClick={this.sendMessage}>send</Button></Col>
                <Col></Col>
            </Row>
 */

/**
 * Chat Room content
 * <Tab.Pane eventKey={value._id} onEnter={()=>{this.setState({activeTab:value._id})}}>
                <Container style={{height:'50vh', overflowY:'scroll'}}>
                    {this.generateMessageBubbles(value.messages)}
                    <div className={this.state.typing?"dot-elastic":""}></div>
                   
                    </Container>
                    <FormGroup>
            <Label for="msgTextArea">Text Area</Label>
            <Input type="textarea" name="text" id="msgTextArea" onKeyPress={evt=>{this.submitMsg(evt, value._id)}} onKeyDown={()=>{this.socket.emit('typing')}} />
          </FormGroup>
            </Tab.Pane>
 */



/**
 *  <Nav.Item>
            <Nav.Link eventKey={value._id} onClick={()=>{
        this.socket.emit('create', value._id);}} >{value.secondUsr}</Nav.Link>
          </Nav.Item>
 */

/**
 * Tab component commented 
 * <Tab.Container id="left-tabs-example" defaultActiveKey="first">
  <Row>
    <Col sm={3}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">Tab 1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Tab 2</Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col sm={9}>
      <Tab.Content>
        <Tab.Pane eventKey="first">
            <p>asdasdasdasdsads</p>
        </Tab.Pane>
        <Tab.Pane eventKey="second">
            <p>asdasdasdasdadqwe sad asd qwd </p>
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container> 

*/