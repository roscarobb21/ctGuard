import React from 'react';

import {Row, Col, Container} from 'reactstrap';
import {Tab, Nav} from 'react-bootstrap';
import { ChatFeed, Message, BubbleGroup } from 'react-chat-ui'
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import './General.css'
const io = require("socket.io-client");

class Chat extends React.Component{
    constructor(props){
        super(props)
        this.state={
            key:null,
            chats:null,
            contor:0,
            activeTab:null,
            socketConnected:false,
            connected:null,
            socket:null,
            typing:false,
            chatId:null,
            activeChat:null,
            currentChat:null, 
        }  
       
    }
    socket = io('http://localhost:3001/')
componentDidMount(){
        this.socket.on('connection', (ata) => {
            alert('conn')
            this.setState({  connected: true })
        });

        this.socket.on('update', (data) => {
            //updating chat
            this.socket.emit('typing')
            this.fetchChat();
        });
        this.socket.on('chat_notification', ()=>{
            this.setState({typing:false})
        })
        this.socket.on('typing', () => {
            this.setState({ typing: true })
        });
        this.socket.on('stop_typing', ()=>{
            this.setState({typing:false})
        })
        this.socket.on('disconnect', () => {
                this.setState({ connected: false })
            });

            this.socket.on('reconnect', () => {
                this.setState({ connected: true })
            });
            this.socket.on('fetch', ()=>{
                this.fetchChat();
            })
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
            if(response.chat.length>0 ){
                this.setState({chats:response.chat})
                return
            }
                this.setState({chats:response.chat})
        })
    }




generateSideBar=()=>{
if(this.state.chats !== null){
  return this.state.chats.map(value=>{
      return(<div className="change-cursor" onClick={()=>{this.gen(value)}}>
          {value}
      </div>)
  })
}
return null;
}
gen=(value)=>{
    
    this.socket.emit('create', this.state.activeChat)
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

showChat=()=>{
 if(this.state.currentChat!== null){
     console.log('this.state.currentChat ', this.state.activeChat)
     let messageArray = this.state.currentChat.messages
    return messageArray.map(message=>{
        return(<div>
            <p>{message.text}</p>
        </div>)
    })
 }
}


 sendMessage= async ()=>{
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
        let ok = await fetch(url, options)
        this.socket.emit(this.state.activeChat.toString(), 'msg')
        document.getElementById("msg-text-area").value=""
        
    }

}

    render(){
       
        console.log('connected', this.state.typing)
        return(<div>
            <NavBar/>
            <Row className="justify-content-center" style={{marginTop:'2vh'}}>
                <Col md="2"></Col>
                <Col sm="12" md="4" >
            
 {this.state.chats!==null?this.generateSideBar():null}

                </Col>
                <Col md="4">
                <div style={{height:'600px', overflowY:'scroll'}}>
{this.state.currentChat!== null?this.showChat():null}
</div>
                </Col>
                <Col md="2"></Col>
            </Row>
            <Row>
                <Col></Col>
                               <Col>
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
        </div>)
    }
}

export default Chat;

/**
 * 
 * 
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