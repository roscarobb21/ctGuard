import React, { Component } from 'react';
import NavBar from '../NavBar/Navbar'
import {Tab, Nav} from 'react-bootstrap';
import {Container, Row, Col} from 'reactstrap';
import {
  AvForm,
  AvField,
  AvGroup,
  AvInput,
  AvRadioGroup,
  AvRadio,
  AvFeedback
} from 'availity-reactstrap-validation';
import { Button, Form, FormGroup, Label, Input, FormText, Spinner,  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter, } from 'reactstrap';
import ImageUploader from 'react-images-upload';

import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import DarkModeToggle from "react-dark-mode-toggle";
import api from '../../constants/api'
import eye from '../../assets/eye.png';
import ctGuardLogo from '../../assets/security.png';

import Switch from '@material-ui/core/Switch';
import edit from '../../assets/edit.png';
import theme from '../../assets/theme.png';
import password from '../../assets/password.png';
import privacy from '../../assets/privacy.png';
import feed from '../../assets/feed.png';
import avatar from '../../assets/hipster.png';

import './Profile.css';

class SettingsPage
 extends Component {
   constructor(props){
     super(props)
     this.state={
       dark:false,
       coutry:'Romania',
       region:'',
      preview: null,
      src:null,
       user:null,
       showOldPas:false,
       closeModal:false,
       modalMsg:null,
       success:null,
       userFlag:false,
       showInfoSpinner:false,
       showAvatarSpinner:false,
       deanonModal:false,
       inputErr:false,
       file:[],
       firstName:"",
       lastName:"",
       deCountry:"",
       deRegion:"",
       timeline:null,
     }
     this.onCrop = this.onCrop.bind(this)
     this.onClose = this.onClose.bind(this)
   }
   onClose() {
    this.setState({preview: null})
  }
  
  onCrop(preview) {
    this.setState({preview})
  }
  onDrop=(file)=>{
  this.setState({file:file})
  }
  selectCountry (val) {
    this.setState({ country: val });
  }

  selectRegion (val) {
    this.setState({ region: val });
  }

  handleTimeline=()=>{
    this.setState({showTimelineSpinner:true})
    let url = api.backaddr+ api.authUser + api.routes.changeTimeline;
    console.log("🚀 ~ file: SettingsPage.jsx ~ line 86 ~ url", url)
    let options = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString()
            },
            body: JSON.stringify({
              timeline:this.state.timeline.toString(),
            }),
        };
        fetch(url, options).then(response=>{
          this.setState({showTimelineSpinner:false})
        })
       
  }

  handleAvatarChange=()=>{
    if(this.state.file.length === 0 ){
        this.setState({modalMsg:"Upload avatar", closeModal:true})
        return
    }
      this.uploadAvatar();
  }
 

  toggleTheme = ()=>{
    localStorage.setItem('dark', !this.state.dark)
    if(this.state.dark){
      document.body.classList.remove('dark-mode')
    document.body.classList.add('white-mode')
    }else {
      document.body.classList.remove('white-mode')
    document.body.classList.add('dark-mode')
    }
    this.setState({dark:!this.state.dark})
    let url = api.backaddr+ api.authUser + api.routes.changeTheme;
    let options = {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options)
  }


  async componentWillMount(){
    let dark = await localStorage.getItem('dark');
    let url = api.backaddr+'/api';
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
 if(response.ok === 1){
    this.setState({user:response.user, dark:response.user.darkTheme, timeline:response.user.feed, region: response.user.region, country:response.user.country})
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
      let url = api.backaddr+'/api/changePass'
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
      let url = api.backaddr + '/api/changeInfo';
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
          country:this.state.country,
          region:this.state.region
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
      let url = api.backaddr+'/api';
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
      this.setState({user:response.user, dark:response.user.darkTheme, timeline: response.user.feed, region:response.user.region, country: response.user.country})
   }else {
     this.setState({user:"unknown"})
   }
   }

  
fetchDeAnon = ()=>{
  let url = api.backaddr + '/api/deAnonRequest';
  let options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        token: localStorage.getItem("token").toString()
    },
    body: JSON.stringify({
      first: this.state.firstName,
      last: this.state.lastName,
      country: this.state.deCountry,
      region: this.state.deRegion,
    }),
};
 fetch(url, options).then(response=>response.json()).then(response=>{
      if(response.ok === 1){
        this.uploadAnonImg();
      }
    })

}
 uploadAnonImg(){
  if (this.state.file !== []) {
    const data = new FormData();
    data.append('avatar', this.state.file[0]);
  
    let url = api.backaddr + '/api/deanonmedia'
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        },
        body: data
    };
    delete options.headers['Content-Type'];
    fetch(url, options).then((response)=>{
      window.location.reload();
    })
    
   

}
}

async uploadAvatar(){
  if (this.state.file !== []) {
    const data = new FormData();
    data.append('avatar', this.state.file[0]);
  
    let url = api.backaddr + '/api/profileAvatar'
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        },
        body: data
    };
    delete options.headers['Content-Type'];
    let urlFetch = await fetch(url, options);
    
    window.location.reload();
}


}


async uploadImg() {
  if (this.state.file !== []) {
      const data = new FormData();
      data.append('avatar', this.state.file[0]);
    
      let url = api.backaddr + '/api/protectedFile'
      let options = {
          method: "POST",
          headers: {
              "Content-Type": "multipart/form-data",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              token: localStorage.getItem("token").toString()
          },
          body: data
      };
      delete options.headers['Content-Type'];
      let urlFetch = await fetch(url, options);
      
      window.location.reload();
  }
}


  changeDeanonModal=()=>{
    if(this.state.firstName.length<=0){
      this.setState({modalMsg:"Enter First Name", closeModal:true})
     return;
    }
    if(this.state.lastName.length<=0){
      this.setState({modalMsg:"Enter Last Name", closeModal:true})
     return;
    }
    if(this.state.deCountry === '' || this.state.deRegion === ''){
      this.setState({modalMsg:"Please provide your location", closeModal:true})
     return;
    }
    if(this.state.file.length === 0){
      this.setState({modalMsg:"Insert a photo of your citizen id", closeModal:true})
     return;
    }

    this.setState({deanonModal:!this.state.deanonModal})
  }
    render() {
      if(this.state.user === null){
        return null;
      }
      const { country, region } = this.state;
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
                    }> <span>Dialog</span> </ModalHeader>
                    <ModalBody>
                   <span>{this.state.modalMsg}</span>
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.changeModalState
                        }>Ok, got it!</Button>
                    </ModalFooter>
                </Modal>

                <Modal size="lg" isOpen={
                       this.state.deanonModal
                    }
                    toggle={
                        this.state.deanonModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> <span>Are you sure about this?</span> </ModalHeader>
                    <ModalBody>


                    <Row style={{marginTop:'1vh'}}>
            <Col md="auto" className="justify-content-start">
          <p className="text-justify">Our privacy options are specifically tuned to support anonimity</p>
          <p className="text-justify">We do not recommend to DeAnon, only if you have a strong reason to do so.</p>
          <p className="text-justify">Keep in mind that, by DeAnon-ing yourself, you will expose all your data</p>

          </Col>
          <Col></Col>
          </Row>
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary"
                            onClick={
                                this.changeDeanonModal
                        }>Cancel</Button>
                        <Button color="danger"
                            onClick={
                                this.fetchDeAnon
                        }>I understand and I take the risk!</Button>
                    </ModalFooter>
                </Modal>
               <div className="background">
                <NavBar/>
                <div className="settings-page-wrapper">
                <Container className="settings-wrapper background-component">
              <span className="change-cursor" onClick={()=>{
                window.location.assign('/profile')
              }}> ← back to profile</span>
              
              <Row>
                <Col>
                <div style={{paddingBottom:'40px'}}>
                <p className="text-header1 text-color"> <img className="icon-large" src={ctGuardLogo}></img>&nbsp;Profile settings</p>
                <hr></hr>
                </div>
                
                </Col>
                
              </Row>
            

              <Tab.Container id="left-tabs-example" defaultActiveKey="change" >
  <Row>
    <Col sm={3}>
      <Nav variant="pills" className="flex-column settings-sidebar" onSelect={(evt)=>{
        if(evt==="edit"){
          this.getUserInfo();
        }
      }}>
         <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="theme"><span><img className="icon-small" src={theme}></img>&nbsp;ctGuard theme</span></Nav.Link>
        </Nav.Item>
        <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="edit"><span><img className="icon-small" src={edit}></img>&nbsp;Edit profile info</span></Nav.Link>
        </Nav.Item>
        <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="avatar"><span><img className="icon-small" src={avatar}></img>&nbsp;Change profile avatar</span></Nav.Link>
        </Nav.Item>
        <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="change"><span><img className="icon-small" src={password}></img>&nbsp;Change Password</span></Nav.Link>
        </Nav.Item>
        <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="privacy"><span><img className="icon-small" src={privacy}></img>&nbsp;Privacy options (deAnon)</span></Nav.Link>
        </Nav.Item>
        <Nav.Item className="settings-sidebar-left">
          <Nav.Link className="settings-nav" eventKey="timeline"><span><img className="icon-small" src={feed}></img>&nbsp;Timeline options</span></Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col sm={9} style={{padding:'10px'}}>
      <Tab.Content  >
        <Tab.Pane eventKey="edit">
          {this.state.user===null?<Spinner/>:<div><FormGroup row>
        <Label for="examplePassword"  sm={2} className="settings-left"><span>Username</span></Label>
        <Col sm={10} md={6}>
          <Input type="text" name="text" id="username" placeholder="Enter your username here" defaultValue={this.state.user!==null?this.state.user.username:"Unknown"} />
          <FormText color="muted" className="text-justify">
           Your username will be diplayed on your profile and your posts
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
      <Label for="password" sm={2} className="settings-left"><span>Email</span></Label>
      <Col sm={10} md={6}>
        <Input type="email" name="text" id="email" placeholder="Enter your email here" defaultValue={this.state.user!==null?this.state.user.email:"Unknown"}/>
        <FormText color="muted" className="text-justify">
         Email which will be used to send notifications or to change password. Must be unique.
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
    <Label for="country" sm={2} className="settings-left"><span>Country</span></Label>
    <Col sm={10} md={6}>
    <CountryDropdown
        className="country-drop"
          value={this.state.country}
          showDefaultOption={true}
          whitelist="RO"
          onChange={(val) => this.selectCountry(val)} />
        <FormText color="muted" className="text-justify">
         The country where are you located
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
    <Label for="region" sm={2} className="settings-left"><span>Region</span></Label>
    <Col sm={10} md={6}>
    <RegionDropdown
        className="region-drop"
          country={this.state.country}
          value={this.state.region}
          onChange={(val) => this.selectRegion(val)} />
        <FormText color="muted" className="text-justify">
         Region where are you located
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
        <Col sm={12}>
        {this.state.showInfoSpinner?<Spinner color='secondary'/>:<Button color="primary" className="float-left" onClick={this.changeUserInfo}>Save</Button>}
        </Col>
      </FormGroup>
  </div>
      }
        </Tab.Pane>

        <Tab.Pane eventKey="privacy">
        {(!this.state.user.anonFlag && !this.state.pending) && <Row><Col><p>Thank you for being a trusted user</p></Col></Row>}
          {(this.state.user.pendingAnon && this.state.user.anonFlag) && (
            <div>
              <span>Your request is proccessing, please wait for an administrator to give a verdict on your case</span> 
              <br></br>
              <br></br>
              <Spinner color="primary"/>
            </div>
          )}
        {(!this.state.user.pendingAnon && this.state.user.anonFlag) && (
          <div>
          <Row>
            <Col md="auto">
            </Col>
          </Row>
          <Row>
          <Col >
            <FormGroup row required>
        <Label for="firstName" sm={2} className="settings-left"><span>First Name</span></Label>
        <Col sm={10} md={6}>
          <Input type="text" name="first" id="firstName" placeholder="Your First Name" 
          onChange={evt=>{this.setState({firstName:evt.target.value})}}
          />
          <FormText color="muted" className="text-justify">
           Enter your real first name
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="lastName" sm={2} className="settings-left"><span>Last Name</span></Label>
        <Col sm={10} md={6}>
          <Input type="text" name="first" id="lastName" placeholder="Your Last Name" 
           onChange={evt=>{this.setState({lastName:evt.target.value})}}
          />
          <FormText color="muted" className="text-justify">
           Enter your real last name
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
    <Label for="country" sm={2} className="settings-left"><span>Country</span></Label>
    <Col sm={10} md={6}>
    <CountryDropdown
        className="country-drop"
          value={this.state.deCountry}
          showDefaultOption={true}
          whitelist="RO"
          onChange={(val) => {this.setState({deCountry:val})}} />
        <FormText color="muted" className="text-justify">
         The country where are you located
        </FormText>
      </Col>
    </FormGroup>
    <FormGroup row>
    <Label for="region" sm={2} className="settings-left"><span>Region</span></Label>
    <Col sm={10} md={6}>
    <RegionDropdown
        className="region-drop"
          country={this.state.deCountry}
          value={this.state.deRegion}
          onChange={(val) => {this.setState({deRegion:val})}} />
        <FormText color="muted" className="text-justify">
         Region where are you located
        </FormText>
      </Col>
    </FormGroup>
      </Col>
          </Row>
          <Row>
            <Col>
            <div>
      
      </div>
      </Col>
          </Row>
          <Row>
                        <Col sm={10} md={10} lg={8}>
                    <ImageUploader withIcon={true}
                            buttonText='Choose image'
                            onChange={
                                this.onDrop
                            }
                            imgExtension={
                                ['.jpg', '.gif', '.png', '.gif']
                            }
                            maxFileSize={5242880}
                            withPreview={true}
                            singleImage={true}/>
                            <FormText color="muted" className="text-justify">
                            Attach a valid citizen card id or passport. It will be user by the authorities in order to identify you.
                            </FormText>
                            </Col>
                     </Row>
                     <Row style={{marginTop:'2vh'}}>
                       <Col className="text-justify">
                         <div >
                       <p>In order to successfully deAnon, you need to provide a valid id card. After providing, you will be sent to the verification queue. An administrator will take care of your case and provide verdict. </p>
                 
                       <p>If <span style={{color:'#ff2e63'}}>deAnon</span> is successfull, you will get the <span style={{color:'#ff2e63'}}>Trusted User</span> badge, and <span style={{color:'#ff2e63'}}>Trusted User</span> achivement.</p>
                       </div>
                       </Col>
                     </Row>
          <Row style={{marginTop:'1vh'}} className="">
            <Col md="auto" className="">
          <Button color="danger" className="float-right" onClick={this.changeDeanonModal}>DeAnon</Button>
          </Col>
          </Row>
          </div>)}
        </Tab.Pane>

        <Tab.Pane eventKey="timeline" style={{padding:'10px'}}>
        <FormGroup row>
         
        <Label for="timeline"><span>Timeline mode</span></Label>
        <Col sm={10} md={8}>
        <Input type="select" name="select" id="exampleSelect" value={this.state.timeline} onChange={evt=>this.setState({timeline:evt.target.value})}>
          <option value={true}>Feed</option>
          <option value={false}>Following</option>
        </Input>
        </Col>
      </FormGroup>
      {this.state.showTimelineSpinner?<Spinner style={{marginTop:"30px"}} className="float-left"/>:<Button style={{marginTop:"30px"}}color="primary" className="float-left" onClick={this.handleTimeline}>Save</Button>}
        </Tab.Pane>
        <Tab.Pane eventKey="achiv">
         <p>avhivements</p>
        </Tab.Pane>
        <Tab.Pane eventKey="change">
          <Container>
            <Row>
              <Col>
              <FormGroup row>
        <Label for="password"  sm={2} className="settings-left"><span>Old password</span></Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="oldPass" placeholder="Enter your old password here" />
          <FormText color="muted" className="text-justify">
            We must verify that is you who changes the password, so we are asking for your old password
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="new" sm={2} className="settings-left"><span>New password</span></Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="newPass" placeholder="Enter your new password here" />
          <FormText color="muted" className="text-justify">
           Choose your new password, but choose wisely. New password must be a strong one.
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="confirm" sm={2} className="settings-left"><span>Confirm</span></Label>
        <Col sm={10} md={6}>
          <Input type="password" name="password" id="confirm" placeholder="Re-enter your new password here" />
          <FormText color="muted" className="text-justify">
           Confirm your new password by re-entering it
          </FormText>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={12}>
        {this.state.showSpinner?<Spinner color='secondary'/>:<Button color="primary" className="float-left" onClick={this.changePassword}>Save</Button>}
        </Col>
      </FormGroup>
              </Col>
            </Row>
          </Container>
        </Tab.Pane>
        <Tab.Pane eventKey="avatar">
          <Row>
            <Col sm="12" md="12" lg="8"><img  className="profile-img" src={this.state.user===null?"":api.cdn+api.avatarMedia.p256+this.state.user.avatarUrl}></img></Col>
            <Col sm="12" md="12" lg="8">
            <div>
      </div>
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
                           {this.state.showAvatarSpinner?<Spinner/>:<Button color="primary" className="float-left" onClick={this.handleAvatarChange}>Save</Button>} 
        </Tab.Pane>
                           
        <Tab.Pane eventKey="theme">
         <p>Switch between dark or white theme</p>
        <div>
         <DarkModeToggle
         className="theme-toggle"
          onChange={()=>{this.toggleTheme()}}
          checked={this.state.dark}
          size={80}
        />
       </div>
      
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>
              </Container>
              </div>
            </div>
            </div>
        );
    }
}

export default SettingsPage;



