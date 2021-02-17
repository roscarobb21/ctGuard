import React, { Component } from 'react';
import NavBar from '../NavBar/Navbar'
import {Tab, Nav} from 'react-bootstrap';
import {Container, Row, Col} from 'reactstrap';

import { Button, Form, FormGroup, Label, Input, FormText, Spinner,  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter, } from 'reactstrap';
  
import ImageUploader from 'react-images-upload';
import api from '../../constants/api'
import eye from '../../assets/eye.png';
class SettingsPage
 extends Component {
   constructor(props){
     super(props)
     this.state={
       user:null,
       showOldPas:false,
       closeModal:false,
       modalMsg:null,
       success:null,
       userFlag:false,
       showInfoSpinner:false,
       deanonModal:false,
     }
   }
   changeDeanonModal=()=>{
     this.setState({deanonModal:!this.state.deanonModal})
   }
   async componentWillMount(){
    let url = api+'/api';
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
 console.log("FROM GET USER INFO ", response.user)
 if(response.ok === 1){
    this.setState({user:response.user})
 }else {
   this.setState({user:"unknown"})
 }
   }
   
   changePassword=()=>{
     let oldPass = document.getElementById("oldPass").value.toString();
     let newPass = document.getElementById("newPass").value.toString();
     let confirm = document.getElementById("confirm").value.toString();
     if(oldPass.length>0 && newPass.length>0 && confirm.length>0){
       this.setState({showSpinner:true})
      let url = api+'/api/changePass'
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString(),
        },
        body: JSON.stringify({
          oldPass: oldPass,
          newPass: newPass,
          confirm: confirm
        }),
      };
      fetch(url, options).then(response=>response.json()).then(response=>{
        if(response.ok === 1 ){
          this.setState({closeModal:true, modalMsg:"Password changed !"})
          window.location.reload();
        }else if(response.ok ===0){
          this.changeModalState();
          this.setState({showSpinner:false, modalMsg:response.err})
        }
      }).catch(err=>{
        
        this.changeModalState();
        this.setState({showSpinner:false, modalMsg:err})
       // alert(err)
      })

     }else {
       this.setState({closeModal:true, modalMsg:"You must not leave the inputs empty"})
     }

   }

   changeUserInfo=()=>{
     this.setState({showInfoSpinner:true})
    let email = document.getElementById("email").value.toString();
    let username = document.getElementById("username").value.toString();
    if(email.length>0 && username.length>0){
//fetch changes and get response  
      let url = api + '/api/changeInfo';
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString(),
        },
        body: JSON.stringify({
          email: email,
          username: username,
        }),
      };
      fetch(url, options).then(response=>response.json()).then(response=>{
        console.log("THE RESPONSE FROM SERVER ", response)
      if(response.ok===1){
        window.location.reload();
      }else if(response.ok === 0 ){
        this.setState({closeModal:true, modalMsg:response.err, showInfoSpinner:false})
      }
      }).catch(err=>{
        this.setState({closeModal:true, modalMsg:err.toString(), showInfoSpinner:false})
      })
    }else {
      this.setState({closeModal:true, modalMsg:"You must not leave the inputs empty", showInfoSpinner:false})
    }

   }
   changeModalState=()=>{
     this.setState({closeModal:!this.state.closeModal})
   }


    getUserInfo= async()=>{
      let url = api+'/api';
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
   console.log("FROM GET USER INFO ", response.user)
   if(response.ok === 1){
      this.setState({user:response.user})
   }else {
     this.setState({user:"unknown"})
   }
   }

    render() {
      
        return (
            <div>
                 <Modal isOpen={
                       this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> Dialog </ModalHeader>
                    <ModalBody>
                   {this.state.modalMsg}
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.changeModalState
                        }>Ok, got it!</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={
                       this.state.deanonModal
                    }
                    toggle={
                        this.state.deanonModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> Dialog </ModalHeader>
                    <ModalBody>
                      Are you sure about this?
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary"
                            onClick={
                                this.changeDeanonModal
                        }>No!</Button>
                        <Button color="danger"
                            onClick={
                                this.changeDeanonModal
                        }>Yes!</Button>
                    </ModalFooter>
                </Modal>
               
                <NavBar/>
                <Container>
              <p className="change-cursor" onClick={()=>{
                window.location.assign('/profile')
              }}> ← back to profile</p>
              <br></br>
              <Row>
                <Col></Col>
                <Col><p className="text-header1">Profile settings</p></Col>
                <Col></Col>
              </Row>
              <Tab.Container id="left-tabs-example" defaultActiveKey="change" >
  <Row>
    <Col sm={3}>
      <Nav variant="pills" className="flex-column" onSelect={(evt)=>{
        if(evt==="edit"){
          this.getUserInfo();
        }
      }}>
        <Nav.Item >
          <Nav.Link eventKey="edit">Edit profile info</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="avatar">Change profile avatar</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="change">Change Password</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="privacy">Privacy options</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="timeline">Timeline options</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="achiv">Achivements</Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col sm={9}>
      <Tab.Content  >
        <Tab.Pane eventKey="edit">
          {this.state.user===null?<Spinner/>:<div><FormGroup row>
        <Label for="examplePassword"  sm={2}>Username</Label>
        <Col sm={10} md={6}>
          <Input type="text" name="text" id="username" placeholder="Enter your username here" defaultValue={this.state.user!==null?this.state.user.username:"Unknown"} />
          <FormText color="muted" className="text-justify">
           Your username will be diplayed on your profile and your posts
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
      <Label for="examplePassword" sm={2}>Email</Label>
      <Col sm={10} md={6}>
        <Input type="email" name="text" id="email" placeholder="Enter your email here" defaultValue={this.state.user!==null?this.state.user.email:"Unknown"}/>
        <FormText color="muted" className="text-justify">
         Email which will be used to send notifications or to change password. Must be unique.
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
        <Col sm={12}>
        {this.state.showInfoSpinner?<Spinner color='secondary'/>:<Button color="primary" onClick={this.changeUserInfo}>Save</Button>}
        </Col>
      </FormGroup>
  </div>
      }

      
        </Tab.Pane>
        <Tab.Pane eventKey="privacy">
          <Row>
            <Col md="auto" className="justify-content-start">
          <p className="text-justify">Our privacy options are specifically tuned to support anonimity</p>
          <p className="text-justify">We do not recommend to DeAnon, only if you have a strong reason to do so.</p>
          <p className="text-justify">Keep in mind that, by DeAnon-ing yourself, you will expose all your data</p>
          <Button color="danger" onClick={this.changeDeanonModal}>DeAnon</Button>
          </Col>
          <Col></Col>
          </Row>
        </Tab.Pane>
        <Tab.Pane eventKey="timeline">
         <p>timeline</p>
        </Tab.Pane>
        <Tab.Pane eventKey="achiv">
         <p>avhivements</p>
        </Tab.Pane>
        <Tab.Pane eventKey="change">
          <Container>
            <Row>
              <Col>
              <FormGroup row>
        <Label for="examplePassword"  sm={2}>Old password</Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="oldPass" placeholder="Enter your old password here" />
          <FormText color="muted" className="text-justify">
            We must verify that is you who changes the password, so we are asking for your old password
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="examplePassword" sm={2}>New password</Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="newPass" placeholder="Enter your new password here" />
          <FormText color="muted" className="text-justify">
           Choose your new password, but choose wisely. New password must be a strong one.
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="examplePassword" sm={2}>Confirm</Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="confirm" placeholder="Re-enter your new password here" />
          <FormText color="muted" className="text-justify">
           Confirm your new password by re-entering it
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={12}>
        {this.state.showSpinner?<Spinner color='secondary'/>:<Button color="primary" onClick={this.changePassword}>Save</Button>}
        </Col>
      </FormGroup>
              </Col>
            </Row>
          </Container>
        </Tab.Pane>
        <Tab.Pane eventKey="avatar">
          <Row>
            <Col md="12"><img  className="profile-img" src={this.state.user===null?"":this.state.user.avatarUrl}></img></Col>
            <Col md="12">
        <ImageUploader withIcon={true}
                            buttonText='Choose images'
                            onChange={
                                this.onDrop
                            }
                            imgExtension={
                                ['.jpg', '.gif', '.png', '.gif']
                            }
                            maxFileSize={5242880}
                            withPreview={true}
                            singleImage={true}/>
                            </Col>
                            </Row>
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>
              </Container>
            </div>
        );
    }
}

export default SettingsPage;