import React, {Component} from 'react';
import {
    Row,
    Col,
    Container,
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
import {Form} from 'react-bootstrap';
import {TextField, Button, FormControl, InputLabel, Input, FormHelperText, IconButton, InputAdornment, OutlinedInput } from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';
import Footer from '../Footer/Footer';

import api from '../../constants/api';
import eye from '../../assets/eye.png';
import ctGuardLogo from '../../assets/security.png';
import ctVideo from '../../assets/ctVideo.mp4';

import { makeStyles } from '@material-ui/core/styles';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import './RegisterAndLogin.css'
import { ThemeConsumer } from 'styled-components';
import { findAllByDisplayValue } from '@testing-library/dom';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";


import '../router/Global.css'


import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
const countries = [{title:"Romania"}, {title:"USA"}]
const region = [{title:"Suceava"}, {title:"Bucuresti"}, {title:"Iasi"}]


const LogInWithFacebook = ()=>{
    return (
   
    
    <FacebookLogin
        appId="859679134858810"
        autoLoad={false}
        fields="name,email,picture"
        onClick={()=>{console.log('onclick')}}
        callback={responseFacebook}
        render={renderProps => (
            <Button variant="outlined" color="primary" onClick={renderProps.onClick} >Log in with Facebook</Button>
          )}
        />
    )
}
const responseFacebook = (response) => {
    let token = response.accessToken;
    if(token !== undefined && token !== null && token !== ""){
     let url=api.backaddr+'/fb'
     let options = {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "Cache-Control": "no-cache, no-store, must-revalidate",
           Pragma: "no-cache",
         },
         body: JSON.stringify({
           email: response.email.toString(),
           name: response.name.toString(),
           id: response.id.toString(),
           accessToken: token
         }),
       };
 
       let Urlresponse =  fetch(url, options).then(response => response.json())
       .then(response => {
         if(response.token !== undefined && response.token !== null){
             localStorage.setItem("token", response.token)
             window.location.replace('/profile')
         }else {
             alert('There is a problem with the facebook login')
         }
       })
   
    }// if token ok
    else {
        alert('There is a problem logging you in with facebook')
    }
 
   }

/**
   * Register page component
   */

class Register extends React.Component{
constructor(props){
    super(props)
    this.state={
        showPass:false,
        replaceSubmit:false,
        email:"",
        username:"",
        password:"",
        confirm:"",
        country:"",
        region:"",
        emailErr:"",
        usernameErr:"",
        passwordErr:"",
        confirmErr:"",
        countryErr:"",
        regionErr:"",
    }
}
isValidEmailAddress = ()=> {
    return !! this.state.email.match(/.+@.+/);
}
SubmitRegisterRequest=()=>{
let errFlag = 0;
if(this.state.email.length === 0 ){
    errFlag=1;
    this.setState({emailErr:"Email is empty"})
}else if (!this.isValidEmailAddress()){
        errFlag=1;
        this.setState({emailErr:"Input provided is not email type"})
}
if(this.state.username.length === 0 ){
    errFlag=1;
    this.setState({usernameErr:"Username is empty"})
}
if(this.state.password.length === 0 ){
    errFlag=1;
    this.setState({passwordErr:"Password field is empty"})
}
if(this.state.password !== this.state.confirm){
    errFlag=1;
    this.setState({confirmErr:"Passwords do not match"})
}
if(this.state.country.length === 0){
    errFlag=1;
    this.setState({countryErr:"Don't leave empty"})
}
if(this.state.region.length === 0){
    errFlag=1;
    this.setState({regionErr:"Don't leave empty"})
}


if(errFlag){return;}

this.setState({replaceSubmit:true});
let url = api.backaddr + '/signup'
let options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache"
    },
    body: JSON.stringify(
        {email: this.state.email.toString(),
         password: this.state.password.toString(),
         confirm: this.state.confirm.toString(),
         username: this.state.username.toString()}
    )
};
fetch(url, options).then(response=>response.json()).then(response=>{

    if(response.ok === 1){
        window.location.assign('/login')
    }else {
        this.setState({replaceSubmit:false});
        if(response.type === "username"){
            this.setState({usernameErr:"Username invalid or already taken"})
        }
        if(response.type === "email"){
            this.setState({emailErr:"Email invalid or already taken"})
        }


    }


})


}

render(){
    return(
        <div className="register-background">
              <Row className="p-1">
                    <Col><p className={"text-header1"}>Are your ready? Register now! </p></Col>
                </Row>
            <Container style={{minHeight:'80vh'}}>
              
                <Row style={{minHeight:'inherit'}} className="">
              
                    <Col md="12" lg="6" className="d-flex justify-content-center" style={{verticalAlign:'center', padding:'20px'}}>
                        <Row className="align-self-center">
                            <Col sm="12" md="12" lg="12">
                        <img src={ctGuardLogo} className="align-self-center" style={{width:'256px', height:'256px', marginTop:'auto', marginBottom:'auto'}}></img> 
                        </Col>
                      
                            <Col sm="12" md="12" lg="12">
                            <p className="text-header1">ctGuard</p>
                            </Col>
                        </Row>
                        </Col>

                    <Col md="12" lg="6" style={{padding:'20px'}}  className="d-flex justify-content-center">
        <div className="align-self-center register-component" style={{}}>
        
            <Row><Col className="m-1 m-xs-1 m-sm-1 m-md-1 m-lg-0" xs="12" sm="12" md="12" lg="6" xl="6">
           
                                                <TextField
                                                
                                  inputProps={{ maxLength: 50 }}
                    style={{width:'inherit'}}
                    error={this.state.emailErr}
                    className="outlined-error-helper-text"
                    label="Email"
                    placeholder="Type your email"
                    helperText={this.state.emailErr.length>0?this.state.emailErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({email:evt.target.value, emailErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                    }}
                                />
                              </Col> 
                              
                              <Col className="m-xs-1 m-sm-1 m-md-1 m-lg-0" xs="12" sm="12" md="12" lg="6" xl="6">
                                  <TextField
                                  style={{width:'inherit'}}
                                  inputProps={{ maxLength: 15 }}
                    error={this.state.usernameErr}
                    className="outlined-error-helper-text"
                    label="Username"
                    maxLength="25"
                    placeholder="Choose an username"
                    helperText={this.state.usernameErr.length>0?this.state.usernameErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({username:evt.target.value, usernameErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                    }}
                                />
                                </Col>
            </Row>
            
            <br></br>
            <Row><Col  className="m-xs-1 m-sm-1 m-md-1 m-lg-0" xs="12" sm="12" md="12" lg="6" xl="6">
            
            <FormControl  
             style={{width:'inherit'}}
            variant="outlined" helperText={this.state.passwordErr.length>0?this.state.passwordErr:""}>
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                                <OutlinedInput
                                                
                                  inputProps={{ maxLength: 25 }}
                                                style={{width:'inherit'}}
                    error={this.state.passwordErr}
                    type={this.state.showPass?"text":"password"}
                    className="outlined-error-helper-text  outlined-adornment-password"
                    label="Password"
                    placeholder="Choose a password"
                    maxLength="25"
                    variant="outlined"
                    onChange={(evt)=>{this.setState({password:evt.target.value, passwordErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                    }}
                    endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={()=>{this.setState({showPass:!this.state.showPass})}}
                            onMouseDown={()=>{this.setState({showPass:!this.state.showPass})}}
                            edge="end"
                          >
                            {this.state.showPass ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      labelWidth={70}

                            />
                                </FormControl>
                              </Col><Col  className="m-xs-1 m-sm-1 m-md-1 m-lg-0" xs="12" sm="12" md="12" lg="6" xl="6">
                                  <TextField
                                  style={{width:'inherit'}}
                                  type="password"
                    error={this.state.confirmErr}
                    maxLength="25"
                    className="outlined-error-helper-text"
                    label="Confirm your password"
                    placeholder="Re-type your password"
                    helperText={this.state.confirmErr.length>0?this.state.confirmErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({confirm:evt.target.value, confirmErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitRegisterRequest()}
                    }}
                                />
                               </Col>

            </Row>
            <br></br>
            <Row>
                <Col xs="12" sm="12" md="12" lg="12" xl="12"  className="m-xs-1 m-sm-1 m-md-1 m-lg-0">
          
<Autocomplete

  className="combo-box-demo"
  options={countries}
  getOptionLabel={(option) => option.title}
  onInputChange={(_, val) => {
    this.setState({country:val, countryErr:""});
   }}
  renderInput={(params) => <TextField {...params} label="Country" variant="outlined"
  className="outlined-error-helper-text"
  onKeyPress={()=>{this.setState({countryErr:""})}}
  error={this.state.countryErr}
  helperText={this.state.countryErr.length>0?this.state.countryErr:""}
  />}
/>
<br></br>
                </Col>
           
            
           
           
                <Col xs="12" sm="12" md="12" lg="12" xl="12"  className="m-xs-1 m-sm-1 m-md-1 m-lg-0">
               
<Autocomplete
    disabled={this.state.country.length>0?false:true}
  className="combo-box-demo outlined-error-helper-text"
  error={this.state.regionErr}
  helperText={this.state.regionErr.length>0?this.state.regionErr:""}
  options={region}
  autoHighlight={true}
  blurOnSelect={true}
  clearOnBlur={true}
  required={true}
  onInputChange={(_, val) => {
    this.setState({region:val, regionErr:""});
   }}
  getOptionLabel={(option) => option.title}
  renderInput={(params) => <TextField {...params} label="Region" variant="outlined"
  className="outlined-error-helper-text"
  onKeyPress={()=>{this.setState({regionErr:""})}}
  error={this.state.regionErr}
  helperText={this.state.regionErr.length>0?this.state.regionErr:""}
  />}
/>
                </Col>
            </Row>
            <br></br>
            {this.state.replaceSubmit && <Spinner/>}
{!this.state.replaceSubmit &&
<Button variant="outlined" color="primary" style={{outline:'none', width:'80%'}} onClick={this.SubmitRegisterRequest}>
  Register!
</Button>}
<div style={{marginTop:'10px',outline:'none', width:'inherit'}}><LogInWithFacebook/></div>
<div>
 
   <div><span> Do you have an account already? <a href="/login">Log In!</a> </span></div>
</div>
        </div>

                    </Col>
                </Row>
            </Container>
            <Footer/>
        </div>
    )
}


}



export default Register;

