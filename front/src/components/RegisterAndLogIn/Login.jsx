import React from 'react';
import {
    Row,
    Col,
   
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
} from 'reactstrap';


import {TextField, Button, FormControl, InputLabel, Input, FormHelperText, IconButton, InputAdornment, OutlinedInput } from '@material-ui/core';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Footer from '../Footer/Footer';  
import eye from '../../assets/eye.png';

import ctLogo from '../../assets/security.png';
import api from '../../constants/api';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'

/**
 * TODO:
 * facebook login throw err if server unavailable
 * Error report button
 * 
 */
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

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state={
            fetchModalVar:false,
            errText:null,
            replaceSubmit:false,
            email:"",
            password:"",
            emailErr:"",
            passwordErr:"",
            width:null,
            height:null,
            resend:false,
        }
    }

    componentWillMount(){
        
        console.log("mount ", window.innerWidth)
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }
    
    updateDimensions = () => {
        console.log("RESIZE ", window.innerWidth)
        this.setState({ width: window.innerWidth, height: window.innerHeight });
      };
      componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
      }
      componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
      }

    isValidEmailAddress = ()=> {
        return !! this.state.email.match(/.+@.+/);
    }
    handleLoginSubmit=()=>{
       
        let errFlag = 0;
        if(this.state.email.length===0){
            this.setState({emailErr:"Email input empty"});
            errFlag = 1;
        }
        if(!this.isValidEmailAddress()){
            this.setState({emailErr:"Please insert Email"});
            errFlag = 1;
        }
        if(this.state.password.length===0){
            this.setState({passwordErr:"Password input empty"});
            errFlag = 1;
        }

        if(errFlag === 1){return;}

        this.setState({replaceSubmit:true})
        let url = api.backaddr + '/login';

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
    
        let Urlresponse =  fetch(url, options).then(response => response.json())
        .then(response => {
            console.log('response : ', response)
           if(response.ok === 0){
               let resend = false;
               if(response.msg === "Email address not confirmed"){
                   resend = true;
               }
          this.setState({passwordErr:" ",emailErr:response.msg, replaceSubmit:false, resend:resend})
          return;
           }
           localStorage.setItem("token", response.token)
           window.location.replace('/profile')
        }).catch(err=>{
          console.error('[Login] Fetch error : ', err.toString())
          this.setState({fetchModalVar:true, errText:err.toString()})
         })


    }

    resendConfirmation = ()=>{
        let url = api.backaddr + '/resend'
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
            body: JSON.stringify({
              email: this.state.email,
            }),
          };
         
          fetch(url, options)
          this.setState({resend:false, emailErr:"Check your inbox for the new link"})
    }
    handleModal=()=> {
        this.setState({
            closeModal: !this.state.closeModal
        })
        if(this.state.finish){
        window.location.replace('/profile')
        }
    }

    fetchModal=()=>{
        this.setState({fetchModalVar:!this.state.fetchModalVar})
    }
    okErrButton=()=>{
        window.location.reload();
    }

    render(){
  
        return(
            <div className="login-page background">
                
                <Modal isOpen={
                       this.state.fetchModalVar
                    }
                    toggle={
                        this.state.fetchModal
                }>
                    <ModalHeader toggle={
                        this.fetchModal
                    }> An error ocurred :( </ModalHeader>
                    <ModalBody>
                  {this.state.errText===null?"Unknown server error":this.state.errText+'. Try again later...'}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary">
                            Report error
                        </Button>
                        <Button color="primary"
                           onClick={
                            this.okErrButton
                    } >Ok, got it!</Button>
                    </ModalFooter>
                </Modal>



           <Row className="" style={{minHeight:'90vh'}}>
               {this.state.width>991?<Col></Col>:null}
                <Col sm="12" md="12" lg="4" className="align-items-center justify-content-center"  >

                <div className="user-login-position float-center">
                   

                <div className="login-component" style={{}}>

                       <a href="/"> <p>← back to register</p></a>
                     <p className="text-header2">Log in on ctGuard <span><img src={ctLogo} style={{width:'36px', height:"36px"}}></img></span></p> 
                   
                           <Row><Col style={{width:'300px'}}>
                                                <TextField
                                  inputProps={{ maxLength: 50 }}
                    style={{width:'300px'}}
                    error={this.state.emailErr}
                    id="outlined-error-helper-text"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    helperText={this.state.emailErr.length>0?this.state.emailErr:''}
                    variant="outlined"
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.handleLoginSubmit()}
                    }}
                    onChange={(evt)=>{this.setState({email:evt.target.value, emailErr:""})}}
                                />
                                </Col>
                    </Row>
                    <br></br>

                    <Row ><Col>
                    <FormControl  variant="outlined" helperText={this.state.passwordErr.length>0?this.state.passwordErr:""}>
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                                <OutlinedInput
                                                
                                  inputProps={{ maxLength: 25 }}
                                                style={{width:'300px'}}
                    error={this.state.passwordErr}
                    type={this.state.showPass?"text":"password"}
                    className="outlined-error-helper-text  outlined-adornment-password"
                    label="Password"
                    placeholder="Choose a password"
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.handleLoginSubmit()}
                    }}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({password:evt.target.value, passwordErr:""})}}
                   
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
                   </Col>
                    </Row>
                    <br></br>

                    <Row >
                        <Col></Col>
                        <Col>
                        
                    {this.state.replaceSubmit && <Spinner/>}
{!this.state.replaceSubmit &&
<Button variant="outlined" color="primary" style={{outline:'none', width:'270px'}} onClick={this.handleLoginSubmit}>
  Log in
</Button>}

                    </Col>
                    <Col></Col>
                    </Row>
    <br></br>
                    <Row >
                        <Col></Col>
                        <Col style={{width:'270px'}}>
                <LogInWithFacebook/>
                </Col>
                <Col></Col>
                    </Row>
<div style={{marginTop:'10px'}}>
    <p>Forgot your password?&nbsp;<a href="/forgot">Reset it!</a></p>
    {this.state.resend && <Button variant="outlined" color="primary" onClick={this.resendConfirmation}>Resend confirmation email?</Button>}
</div>


 </div>
                         

                
                
                 </div>
                </Col>
                
               {this.state.width>991?<Col></Col>:null}
           </Row>

           <Row><Col>
               <Footer/>
               </Col>
    
           </Row>


           </div>
           
        )
    }
}


export default Login;
