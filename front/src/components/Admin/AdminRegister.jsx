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
    FormText,
    FormFeedback 
} from 'reactstrap';


import eye from '../../assets/eye.png';

import api from '../../constants/api';

import Footer from '../Footer/Footer';

import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import ctGuardLogo from '../../assets/security.png';

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
            emailErr:false,
            usernameErr:false,
            username:"",
            email:"",
            password:"",
            confirm:"",
            regToken:"",
            usernameErr:"",
            regTokenErr:"",
            country:"",
            region:"",
            countryErr:"",
            regionErr:"",
            functionTxt:"",
            firstName:"",
            lastName:"",
        }
    }
    handleModal=()=>{
        this.setState({closeModal:!this.state.closeModal, replaceSubmit:false})

    }
    SubmitRegisterRequest=()=>{
        this.setState({replaceSubmit:true})
        let success=1;
      
        if(this.state.email.length ===0)
        {
            this.setState({errNumber:true,errText:"Please enter your email", closeModal:true})
            return
        }
        if(this.state.username.length === 0)
        {
            this.setState({errNumber:true,errText:"Please enter an username", closeModal:true})
            return
        } 
        if(this.state.password.length ===0)
        {
            this.setState({errNumber:true,errText:"Please enter your password", closeModal:true})
            return
        } 
        if(this.state.confirm !== this.state.password)
        {
            this.setState({errNumber:true,errText:"Passwords do not match", closeModal:true})
            return
        } 
        if(this.state.country.length ===0)
        {
            this.setState({errNumber:true,errText:"Select country", closeModal:true})
            return
        } 
        if(this.state.region.length ===0)
        {
            this.setState({errNumber:true,errText:"Select region", closeModal:true})
            return
        } 
        if(this.state.firstName.length ===0)
        {
            this.setState({errNumber:true,errText:"Enter your First Name", closeModal:true})
            return
        } 
        
        if(this.state.lastName.length ===0)
        {
            this.setState({errNumber:true,errText:"Enter your Last Name", closeModal:true})
            return
        } 
        if(this.state.functionTxt.length ===0)
        {
            this.setState({errNumber:true,errText:"Enter your function", closeModal:true})
            return
        } 
        if(this.state.regToken.length === 0)
        {
            this.setState({errNumber:true,errText:"Token input empty", closeModal:true})
            return
        } 
        let url=api.backaddr+'/adminReg'
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
              confirm: this.state.confirm,
              username: this.state.username,
              firstName:this.state.firstName,
              lastName:this.state.lastName,
              country:this.state.country,
              region:this.state.region,
              functionTxt:this.state.functionTxt,
              token:this.state.regToken,
            }),
          };
          fetch(url, options).then(response=>response.json()).then(response=>{
              
              if(response.ok === 0){
                  if(response.msg === "username"){                 
                        this.setState({errText:"Username already taken", closeModal:true, usernameErr:true})
                }
                  if(response.msg === "email"){              
                           this.setState({errText:"Email already taken", closeModal:true, emailErr:true})
                        }
              }
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
            <Modal
            className="background-component"
            unmountOnClose={true}
            autoFocus={true}
            isOpen={
                   this.state.closeModal
                }
                toggle={
                    this.state.closeModal
            }>
                <ModalHeader toggle={
                    this.closeModal
                    
                }> {this.state.errNumber?<span>Error dialog</span>:<span>Dialog</span>}
                </ModalHeader>
                <ModalBody>
                <span>{this.state.errText}</span>
                
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
        <Col xs="12" sm="12" md="12" lg="4" xl="4">
            <div style={{minHeight:'80vh'}}>
            <div className="user-login-position admin-register-box background-component" >
                <div className="fade-in">
                    <p className="text-header2">Register as admin on ctGuard&nbsp;<img className="reglog-ct-logo" src={ctGuardLogo} title="ctGuard"></img>
                    </p>
                    <br></br>
                    </div>
                    <Row>
                        <Col>
                        
                        <FormGroup>
                            <Label  for="email" className="float-left"><span>Email</span></Label>
                            <Input invalid={this.state.emailErr} type="email" name="email" id="email" placeholder="Enter organizational email" 
                            onChange={evt=>{this.setState({email:evt.target.value})}}
                            onKeyPress={(evt)=>{
                                this.setState({emailErr:false})
                                if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                            }}
                            />
                             
                        </FormGroup>

                        <FormGroup>
                            <Label for="password" className="float-left" ><span>Pasword</span></Label>
                            <Input type="password" name="password" id="password" placeholder="Set a password"
                            onChange={evt=>{this.setState({password:evt.target.value})}}
                            onKeyPress={(evt)=>{
                                if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                            }}
                            /> 
                        </FormGroup>
                                <FormGroup >
                                <Label for="country"  className="float-left"><span>Country</span></Label>
                                <CountryDropdown
                                    className="country-drop"
                                    value={this.state.country}
                                    showDefaultOption={true}
                                    whitelist="RO"
                                    onChange={val=>{this.setState({country:val})}}
                                    onKeyPress={(evt)=>{
                                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                    }}
                                   />
                                   
                                </FormGroup>
                                    <FormGroup>
                                        <Label for="first" className="float-left"><span>First Name</span></Label>
                                        <Input type="text" name="first" id="first" placeholder="Enter your First Name" 
                                        onChange={evt=>{this.setState({firstName:evt.target.value})}}
                                        
                                        onKeyPress={(evt)=>{
                                            if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                        }}
                                        />
                                    </FormGroup>
                        </Col>
                        <Col>
                                    <FormGroup>
                                        <Label for="username" className="float-left"><span>Username</span></Label>
                                        <Input invalid={this.state.usernameErr} type="text" name="username" id="username" placeholder="Enter your username" 
                                        onChange={evt=>{this.setState({username:evt.target.value})}}
                                        onFocus={()=>{this.setState({emailErr:false})}}
                                        onKeyPress={(evt)=>{
                                            this.setState({usernameErr:false})
                                            if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                        }}
                                        />
                                        
                                    </FormGroup>
                                    <FormGroup>
                                    <Label for="confirm" className="float-left"><span>Confirm password</span></Label>
                                    <Input type="password" name="confirm" id="confirm" placeholder="Confirm your password"
                                    onChange={evt=>{this.setState({confirm:evt.target.value})}}
                                    onKeyPress={(evt)=>{
                                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                    }}
                                    />
                                </FormGroup>
                                    <FormGroup>
                                                <Label for="region" className="float-left"><span>Region</span></Label>
                                                <RegionDropdown
                                                    className="region-drop remove-margin-top"
                                                    country={this.state.country}
                                                    value={this.state.region}
                                                    onChange={val =>{this.setState({region:val})}}
                                                    onKeyPress={(evt)=>{
                                                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                                    }}
                                                    />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="last" className="float-left"><span>Last Name</span></Label>
                                        <Input type="text" name="last" id="last" placeholder="Enter your Last Name" 
                                        onChange={evt=>{this.setState({lastName:evt.target.value})}}
                                        onKeyPress={(evt)=>{
                                            if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                        }}
                                        />
                                    </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                                    <FormGroup>
                                        <Label for="function" className="float-left"><span>Function</span></Label>
                                        <Input type="text" name="function" id="function" placeholder="Enter your Function"
                                        onChange={evt=>{this.setState({functionTxt:evt.target.value})}}
                                        onKeyPress={(evt)=>{
                                            if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                        }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="token" className="float-left"><span>Registration Token</span></Label>
                                        <Input type="text" name="token" id="token" placeholder="Enter the token provided by Admin"
                                        onChange={evt=>{this.setState({regToken:evt.target.value})}}
                                        onKeyPress={(evt)=>{
                                            if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                                        }}
                                        />
                                    </FormGroup>
                        </Col>
                    </Row>
                    <div>
                        <Row>
                            <Col>
                            <p>Have an account already?&nbsp;<a href="/admin/login">Log&nbsp;in!</a></p>
                            </Col>
                            <Col>
                            <p>Forgot your password?&nbsp;<a href="/forgot">Reset&nbsp;it!</a></p>
                            </Col>
                        </Row>
                    </div>
                    <div>
                            {this.state.replaceSubmit?<div><Spinner color="primary" /></div>:<Button outline color="primary"
                        onClick={this.SubmitRegisterRequest}
                           >Register</Button>}
                        </div>
                    </div>
            </div>
        </Col>
        <Col></Col>
    </Row>
   
    <Row>
        <Col>
        
    <Footer/></Col>
    </Row>
    </div>
        );
    }
}

export default AdminRegister;


/**
 * 
 * Previous 
 *     <Col xs="12" sm="12" md="12" lg="4" xl="4">
            <div style={{minHeight:'80vh'}}>
            <div className="user-login-position admin-register-box" >
                <div className="fade-in">
                    <p className="text-header2">Register as admin on ctGuard&nbsp;<img className="reglog-ct-logo" src={ctGuardLogo} title="ctGuard"></img>
                    </p>
                    <br></br>
                    <AvForm >
                         
                         <AvGroup>
                            <Label className="float-left" for="username"
                                style={
                                    {color: "black"}
                            }>Username</Label>
                            <InputGroup>
                                <AvInput name="username" placeholder="Pick your desired username" required
                                onChange  = {evt=>{this.setState({username:evt.target.value})}}
                                  onKeyPress={(key)=>{
                                    if(key.key==="Enter")
                                    {
                                        this.SubmitRegisterRequest();
                                    }
                        }}/>
                            </InputGroup>
                        </AvGroup>
                        <AvGroup>
                            <Label
                            className="float-left"
                            for="email"
                                style={
                                    {color: "black"}
                            }>Email</Label>
                            <InputGroup>
                                <AvInput name="email" placeholder="Your organizational email goes here" required
                                 onChange  = {evt=>{this.setState({email:evt.target.value})}}
                                onKeyPress={(key)=>{
                                    if(key.key==="Enter")
                                    {
                                        this.SubmitRegisterRequest();
                                    }
                        }}/>
                            </InputGroup>
                        </AvGroup>
                        <AvGroup>
                            <Label
                            className="float-left"
                            for="pass"
                                style={
                                    {color: "black"}
                            }>Password</Label>
                            <InputGroup>
                                <AvInput 
                                type={this.state.showPass===true?"text":"password"}
                                    name="pass"
                                    placeholder="Your Password goes here"
                                    required
                                    onChange  = {evt=>{this.setState({password:evt.target.value})}}
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
                            <Label 
                            className="float-left"
                            for="pass"
                                style={
                                    {color: "black"}
                            }>Confirm Password</Label>
                            <InputGroup>
                                <AvInput 
                                type={this.state.showConfirm===true?"text":"password"}
                                    name="confirm"
                                    placeholder="Confirm your password"
                                    required
                                    onChange  = {evt=>{this.setState({confirm:evt.target.value})}}
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
                            <Label 
                            className="float-left"
                            for="pass"
                                style={
                                    {color: "black"}
                            }>Registration Token</Label>
                            <InputGroup>
                                <AvInput 
                                type="text"
                                    name="token"
                                    placeholder="Enter the admin registration token here"
                                    required
                                    onChange  = {evt=>{this.setState({regToken:evt.target.value})}}
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
                        <Row>
                            <Col>
                            <p>Have an account already?&nbsp;<a href="/admin/login">Log&nbsp;in!</a></p>
                            </Col>
                            <Col>
                            <p>Forgot your password?&nbsp;<a href="/forgot">Reset&nbsp;it!</a></p>
                            </Col>
                        </Row>
                    </div>
                    <div>
                            {this.state.replaceSubmit?<div><Spinner color="dark" /></div>:<Button outline color="primary"
                        onClick={this.SubmitRegisterRequest}
                           >Register</Button>}
                        </div>
                </div>
            </div>
            </div>
        </Col>
 */