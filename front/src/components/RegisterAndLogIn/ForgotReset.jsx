import React, { Component } from 'react';
import {Container, Row, Col, Spinner} from 'reactstrap';

import ctGuardLogo from '../../assets/security.png';

import {TextField, Button } from '@material-ui/core';
import Footer from '../Footer/Footer'
import api from '../../constants/api'

class ForgotReset extends Component {
    constructor(props){
        super(props);
        this.state={
            token:"",
            replaceSubmit:false,
            loading:true,
            allowed:false,
            password:"",
            confirm:"",
            passwordErr:"",
            confirmErr:"",
        }
    }
    isValidEmailAddress = ()=> {
        return !! this.state.email.match(/.+@.+/);
    }
    componentWillMount(){
        /**
         * Get the post id from url
         */
        let path = window.location.pathname;
       
            let id = path.split('/')[2]
            if(id !== undefined && id !== null){
                    this.setState({token:id})
            }
            let url = api.backaddr + '/reset?token='+id;
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache"
                }
            };
            fetch(url, options).then(response=>response.json()).then(response=>{
                if(response.ok === 1){
                    this.setState({loading:false, allowed:true})
                }else {
                    this.setState({loading:false, allowed:false})
                }
            })


    }

    SubmitResetRequest=()=>{
       let errFlag = 0;
       if(this.state.password.length === 0){
           this.setState({passwordErr:"Password is empty"});
           errFlag=1;
       }
       if(this.state.confirm.length === 0 || this.state.confirm !== this.state.password){
           this.setState({confirmErr:"Passwords do not match"})
        errFlag=1;
    }
    if(errFlag === 1){return;}
    let url = api.backaddr + '/reset?token='+this.state.token;
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache"
        },
         body: JSON.stringify(
            {password: this.state.password.toString(), confirm:this.state.confirm.toString()}
        )
    };
    fetch(url, options).then(response=>response.json()).then(response=>{
        if(response.ok === 1){
            window.location.assign('/login');
            return;
        }
        window.location.reload();
    })


    }


    render() {
        
        if(!this.state.allowed && !this.state.loading){

            return (
                <div className="background" style={{minHeight:'100vh', minWidth:'100vw'}}>
                    <div className="forgot-header-wrapper footer-header" style={{backgroundColor:"#393e46"}}>
                        <div className="change-cursor" onClick={()=>{window.location.assign('/')}}>
                        <Row>
                            <Col>
                    <img style={{width:'100px', height:'100px', padding:'10px'}} src={ctGuardLogo}></img>
                    </Col>
                    </Row>
                    <Row>
                        <Col>
                        <p className="text-header2 text-color" >ctGuard</p>
                        </Col>
                    </Row>
                    </div>
                    </div>
                    <div className="background">
                    <Container  style={{minHeight:'70vh'}}>
                    <Row style={{minHeight:'inherit'}}>
                        <Col></Col>
                        <Col  xs="12" sm="12" md="12" lg="4" xl="4" className="d-flex justify-content-center">
                        <div  className="align-self-center background-component forgot-reset flex vertical-center" >
                            <p className="text-header2 text-color vertical-center">The link you provided does not allow password resets</p>
                        </div>
                        </Col>
                        <Col></Col>
                    </Row>
                    </Container>
                    </div>
                    <Footer/>
                </div>
            );
        }


        if(this.state.allowed && !this.state.loading){
        return (
            <div className="background" style={{minHeight:'100vh', minWidth:'100vw'}}>
                <div className="forgot-header-wrapper footer-header " style={{backgroundColor:"#393e46"}}>
                    <Row>
                        <Col>
                <img style={{width:'100px', height:'100px', padding:'10px'}} src={ctGuardLogo}></img>
                </Col>
                </Row>
                <Row>
                    <Col>
                    <p className="text-header2 text-color" >ctGuard</p>
                    </Col>
                </Row>
                </div>
                <div className="background">
                <Container className="background" style={{minHeight:'70vh'}}>
                <Row style={{minHeight:'inherit'}}>
                    <Col></Col>
                    <Col  xs="12" sm="12" md="12" lg="4" xl="4" className="d-flex justify-content-center">
                    <div  className="align-self-center forgot-reset" style={{}}>
                        <p className="text-header2">Reset your password</p>
                        <TextField
                        type="password"
                    style={{width:'inherit'}}
                    error={this.state.passwordErr}
                    className="outlined-error-helper-text"
                    label="New Password"
                    placeholder="Type your new password"
                    helperText={this.state.passwordErr.length>0?this.state.passwordErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({password:evt.target.value, passwordErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitResetRequest()}
                    }}
                                />
                                <br></br>
                                <br></br>
                                <TextField
                        type="password"
                    style={{width:'inherit'}}
                    error={this.state.confirmErr}
                    className="outlined-error-helper-text"
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    helperText={this.state.confirmErr.length>0?this.state.confirmErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({confirm:evt.target.value, confirmErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitResetRequest()}
                    }}
                                />
                                <br></br>
                                <br></br>
                                {this.state.replaceSubmit && <Spinner/>}
{!this.state.replaceSubmit &&
<Button variant="outlined" color="primary" style={{outline:'none', width:'inherit'}} onClick={this.SubmitResetRequest}>
  Reset your password
</Button>}
                    </div>
                    </Col>
                    <Col></Col>
                </Row>
                </Container>
                </div>
                <Footer/>
            </div>
        );
}
return(<div><Spinner/></div>)
    }
}

export default ForgotReset;