import React, { Component } from 'react';
import {Container, Row, Col, Spinner} from 'reactstrap';

import ctGuardLogo from '../../assets/security.png';

import {TextField, Button } from '@material-ui/core';
import Footer from '../Footer/Footer'

import { withRouter } from "react-router-dom";
import api from '../../constants/api'

class Forgot extends Component {
    constructor(props){
        super(props);
        this.state={
            replaceSubmit:false,
            email:"",
            emailErr:"",
            displayOk:false,
        }
    }
    isValidEmailAddress = ()=> {
        return !! this.state.email.match(/.+@.+/);
    }
    SubmitResetRequest=()=>{
        let errFlag = 0;
        if(this.state.email.length === 0 ){
            errFlag=1;
            this.setState({emailErr:"Email is empty"})
        }else if (!this.isValidEmailAddress()){
                errFlag=1;
                this.setState({emailErr:"Input provided is not email type"})
        }
        if(errFlag === 1){return;}
        let url = api.backaddr + '/forgot'
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache"
            },
            body: JSON.stringify(
                {email: this.state.email.toString()}
            )
        };
        fetch(url, options).then(response=>response.json()).then(response=>{
            this.setState({displayOk:true})
        })
    }


    render() {

        //forgot without arguments
        return (
            <div style={{minHeight:'100vh', minWidth:'100vw'}} className="background">
                <div className="forgot-header-wrapper" style={{backgroundColor:"#393e46"}}>
                    <div className="change-cursor" onClick={()=>{window.location.assign('/')}}> 
                    <Row>
                        <Col>
                <img style={{width:'100px', height:'100px', padding:'10px'}} src={ctGuardLogo}></img>
                </Col>
                </Row>
                <Row>
                    <Col>
                    <p className="text-header2" style={{color:'white'}}>ctGuard</p>
                    </Col>
                </Row>
                </div>
                </div>
                <Container  style={{minHeight:'70vh'}}>
                <Row style={{minHeight:'inherit'}}>
                    <Col></Col>
                    <Col xs="12" sm="12" md="12" lg="4" xl="4" className="d-flex justify-content-center">
                    <div  className="align-self-center forgot-component" style={{}}>
                        <p className="text-header2">Forgot your password?</p>
                        <TextField
                    style={{width:'inherit'}}
                    error={this.state.emailErr}
                    className="outlined-error-helper-text"
                    label="Email"
                    placeholder="Type your email"
                    helperText={this.state.emailErr.length>0?this.state.emailErr:""}
                    variant="outlined"
                    onChange={(evt)=>{this.setState({email:evt.target.value, emailErr:""})}}
                    onKeyPress={(evt)=>{
                        if(evt.key === "Enter"){this.SubmitResetRequest()}
                    }}
                                />
                                <br></br>
                                <br></br>
                                {this.state.replaceSubmit && <Spinner/>}
{!this.state.replaceSubmit &&
<Button variant="outlined" color="primary" style={{outline:'none', width:'inherit'}} onClick={this.SubmitResetRequest}>
  Request password reset
</Button>}
<br></br>
{this.state.displayOk && <p>An email has been sent!</p>}
                    </div>
                    </Col>
                    <Col></Col>
                </Row>
                </Container>
                <Footer/>
            </div>
        );
    }
}

export default withRouter(Forgot);