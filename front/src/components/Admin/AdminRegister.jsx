import React, { Component } from 'react';
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

import api from '../../constants/api';

import '../RegisterAndLogIn/RegisterAndLogin.css';

class AdminRegister extends Component {
    constructor(props){
        super(props);
        this.state={
            showPass:false,
            showConfirm:false,
            closeModal:false,
            allValid:true,
            errNumber:null,
            replaceSubmit:false,
            fetchModalVar:false,
            errText:null,
        }
    }
    handleModal=()=>{
        this.setState({closeModal:!this.state.closeModal, replaceSubmit:false})

    }
    SubmitRegisterRequest=()=>{
        this.setState({replaceSubmit:true})
        let success=1;
         if(document.getElementById("username").value==="")
        {
            this.setState({errNumber:true,errText:"Username input empty", closeModal:true})
            return
        } 
        if(document.getElementById("email").value==="")
        {
            this.setState({errNumber:true,errText:"Email input empty", closeModal:true})
            return
        }
        if(document.getElementById("pass").value==="")
        {
            this.setState({errNumber:true,errText:"Password input empty", closeModal:true})
            return
        } 
        if(document.getElementById("confirm").value==="" || document.getElementById("confirm").value!==document.getElementById("pass").value )
        {
            this.setState({errNumber:true,errText:"Confirm input empty", closeModal:true})
            return
        } 
        if(document.getElementById("token").value==="" || document.getElementById("token").value!==document.getElementById("token").value )
        {
            this.setState({errNumber:true,errText:"Token input empty", closeModal:true})
            return
        } 
        let url=api+'/adminReg'
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
            body: JSON.stringify({
              email: document.getElementById("email").value,
              password: document.getElementById("pass").value,
              confirm: document.getElementById("confirm").value,
              username: document.getElementById("username").value,
              token:document.getElementById("token").value,
            }),
          };
          fetch(url, options).then(response=>response.json()).then(response=>{
              if(response.ok === 1){
                  window.location.assign('/admin/login')
              }
          }).catch(err=>{
              window.location.reload()
          })
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
                    
                }> {this.state.errNumber?"Error dialog":"Dialog"}
                </ModalHeader>
                <ModalBody>
                {this.state.errText}
                
                </ModalBody>
                <ModalFooter>
                    <Button color="primary"
                        onClick={
                            this.handleModal
                    }>Ok, got it!</Button>
                </ModalFooter>
            </Modal>
           
        <Row>
        <Col></Col>
        <Col xs="12" sm="6" md="4">
            <div className="user-login-position">
                <div className="fade-in">
                    <p className="text-header1">Register as admin:
                    </p>
                    <br></br>
                    <AvForm >
                         
                         <AvGroup>
                            <Label for="username"
                                style={
                                    {color: "black"}
                            }>Username</Label>
                            <InputGroup>
                                <AvInput name="username" placeholder="Pick your desired username" required
                                  onKeyPress={(key)=>{
                                    if(key.key==="Enter")
                                    {
                                        this.SubmitRegisterRequest();
                                    }
                        }}/>
                            </InputGroup>
                        </AvGroup>
                        <AvGroup>
                            <Label for="email"
                                style={
                                    {color: "black"}
                            }>Email</Label>
                            <InputGroup>
                                <AvInput name="email" placeholder="Your organizational email goes here" required
                                onKeyPress={(key)=>{
                                    if(key.key==="Enter")
                                    {
                                        this.SubmitRegisterRequest();
                                    }
                        }}/>
                            </InputGroup>
                        </AvGroup>
                        <AvGroup>
                            <Label for="pass"
                                style={
                                    {color: "black"}
                            }>Password</Label>
                            <InputGroup>
                                <AvInput 
                                type={this.state.showPass===true?"text":"password"}
                                    name="pass"
                                    placeholder="Your Password goes here"
                                    required
                                    onKeyPress={(key)=>{
                                        if(key.key==="Enter")
                                        {
                                            this.SubmitRegisterRequest();
                                        }
                            }}/>
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
                            <Label for="pass"
                                style={
                                    {color: "black"}
                            }>Confirm Password</Label>
                            <InputGroup>
                                <AvInput 
                                type={this.state.showConfirm===true?"text":"password"}
                                    name="confirm"
                                    placeholder="Confirm your password"
                                    required
                                    onKeyPress={(key)=>{
                                        if(key.key==="Enter")
                                        {
                                            this.SubmitRegisterRequest();
                                        }
                            }}/>
                                <InputGroupAddon addonType="append">
                                    <InputGroupText>
                                        <img src={eye}
                                            className="show-pass-icon"
                                            onClick={()=>{this.setState({showConfirm:!this.state.showConfirm})}}
                                          ></img>
                                    </InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
                        </AvGroup>
                        <AvGroup>
                            <Label for="pass"
                                style={
                                    {color: "black"}
                            }>Token</Label>
                            <InputGroup>
                                <AvInput 
                                type="text"
                                    name="token"
                                    placeholder="Enter the admin registration token here"
                                    required
                                    onKeyPress={(key)=>{
                                        if(key.key==="Enter")
                                        {
                                            this.SubmitRegisterRequest();
                                        }
                            }}/>
                              
                            </InputGroup>
                        </AvGroup>
                        
                    </AvForm>
                    <div>
                            {this.state.replaceSubmit?<div><Spinner color="dark" /></div>:<Button outline color="primary"
                        onClick={this.SubmitRegisterRequest}
                           >Register</Button>}
                        </div>
                </div>
            </div>
        </Col>
        <Col></Col>
    </Row>
    </div>
        );
    }
}

export default AdminRegister;