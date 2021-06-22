import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Row,
    Col,
    Button,
    Label,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupButton,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
} from 'reactstrap';
import {
    AvForm,
    AvField,
    AvGroup,
    AvInput,
    AvRadioGroup,
    AvRadio,
    AvFeedback
} from 'availity-reactstrap-validation';

import eye from '../../assets/eye.png';
import ctGuardLogo from '../../assets/security.png';
import api from '../../constants/api';



import Footer from '../Footer/Footer';

import './Admin.css';

class AdminLogin extends Component {
    constructor(props) {
        super(props);
        this.state={
            fetchModalVar:false,
            errText:null,
            replaceSubmit:false,
            isErr:'',
            err:false,
            closeModal:false,
            email:"",
            password:"",
           
    }
}
    handleModal=()=> {
        this.setState({
            closeModal: !this.state.closeModal,
            replaceSubmit:false,
        })
    }

    handleLoginSubmit=()=>{
        this.setState({replaceSubmit:true})
        let route='/adminLog'
        if(this.state.email.length === 0)
        {
            this.setState({isErr:"Email input empty", closeModal:true, err:true})
            return
        }   
        if(this.state.password.length === 0)
        {
            this.setState({isErr:"Password input empty", closeModal:true, err:true})
            return
        } 
        let url = api.backaddr + route;

        let options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          body: JSON.stringify({
            email: this.state.email,
            password: this.state.password,
          }),
        };
    
         fetch(url, options).then(response => response.json())
        .then(response => {
            if(response.ok === 0 ){
                this.setState({isErr:response.msg, closeModal:true, err:true})
            }
            if(response.token !== undefined && response.user.isAdmin === true ){
                localStorage.setItem("token", response.token)
                localStorage.setItem("isAdmin", response.user.isAdmin)
                window.location.replace('/admin/dashboard')
            }
        }).catch(err=>{
          console.error('[Login] Fetch error : ', err.toString())
          window.location.reload();
         })
    }

    render() {
        return (
            <div className="login-page">
                <Modal 
                className="background-component"
                isOpen={
                       this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> {this.state.err?<span>Error Dialog</span>:<span>Dialog</span>} </ModalHeader>
                    <ModalBody>
                    <span>{this.state.isErr}</span>
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.handleModal
                        }>Ok, got it!</Button>
                    </ModalFooter>
                </Modal>
              

               
           <Row style={{minHeight:'90vh'}}>
                <Col></Col>
                <Col xs="12" sm="6" md="4">
                <div className="user-login-position admin-login-box background-component">
                    <div className="fade-in">
                    <a href="/admin/register"> <p>← register as Administrator</p></a>
                        <p className="text-header2">Log in as admin on ctGuard&nbsp;<img className="reglog-ct-logo" src={ctGuardLogo} title="ctGuard"></img>
                        </p>
                        <br></br>
                        <AvForm >  
                             <AvGroup>
                                <Label
                                className="float-left"
                                for="email"
                                    style={
                                        {color: "black"}
                                }><span>Email</span></Label>
                                <InputGroup>
                                    <AvInput name="email" placeholder="Enter your email " required
                                    onChange={evt=>{this.setState({email:evt.target.value})}}
                                      onKeyPress={(key)=>{
                                        if(key.key==="Enter")
                                        {
                                            this.handleLoginSubmit();
                                        }
                            }}
                                    />
                                </InputGroup>
                            </AvGroup>
                            <AvGroup>
                                <Label 
                                className="float-left"
                                for="pass"
                                    style={
                                        {color: "black"}
                                }><span>Password</span></Label>
                                <InputGroup >
                                    <AvInput 
                                    type={this.state.showPass===true?"text":"password"}
                                        name="pass"
                                        placeholder="Your Password goes here"
                                        required
                                        onChange={evt=>{this.setState({password:evt.target.value})}}
                                        onKeyPress={(key)=>{
                                            if(key.key==="Enter")
                                            {
                                                this.handleLoginSubmit();
                                            }
                                }}
                                        />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>
                                            <img src={eye}
                                                className="show-pass-icon"
                                                onClick={()=>{this.setState({showPass:!this.state.showPass})}}
                                             ></img>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>   
                            </AvGroup>
                            <AvGroup>
                            </AvGroup>
                            <div>
                            <p>Forgot your password?&nbsp;<a href="/forgot">Reset&nbsp;it!</a></p>
                            </div>
                            {this.state.replaceSubmit?<div><Spinner color="primary"  /></div>:<Button outline color="primary"
                              onClick={this.handleLoginSubmit} >Submit</Button>}
                            </AvForm>
                            </div>
                            </div>
                </Col>
                <Col></Col>
           </Row>
           <Row>
               <Col>
               <Footer/>
               </Col>
           </Row>
           </div>
        );
    }
}


export default AdminLogin;