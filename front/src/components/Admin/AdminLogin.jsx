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
import api from '../../constants/api';

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
if(document.getElementById("email").value==="")
        {
            this.setState({isErr:"Email input empty", closeModal:true, err:true})
            return
        }
        if(document.getElementById("pass").value==="")
        {
            this.setState({isErr:"Password input empty", closeModal:true, err:true})
            return
        } 
        let url = api + route;

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
          }),
        };
    
         fetch(url, options).then(response => response.json())
        .then(response => {
        console.log("user.isAdmin : ", response.user)
            if(response.token !== undefined && response.user.isAdmin === true ){
        localStorage.setItem("token", response.token)
        localStorage.setItem("isAdmin", response.user.isAdmin)
        window.location.replace('/admin/dashboard')
        return
            }
            window.location.reload()
        }).catch(err=>{
          console.error('[Login] Fetch error : ', err.toString())
          window.location.reload();
         })
    }

    render() {
        return (
            <div className="login-page">
                <Modal isOpen={
                       this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> {this.state.err?"Error Diaog":"Dialog"} </ModalHeader>
                    <ModalBody>
                    {this.state.isErr}
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.handleModal
                        }>Ok, got it!</Button>
                    </ModalFooter>
                </Modal>
              

               <a href="/"> <p>← back to home</p></a>
           <Row>
                <Col></Col>
                <Col xs="12" sm="6" md="4">
                <div className="user-login-position">
                    <div className="fade-in">
                        <p className="text-header1">ctGuard Admin Login
                        </p>
                        <br></br>
                        <AvForm >  
                             <AvGroup>
                                <Label for="email"
                                    style={
                                        {color: "black"}
                                }>Email</Label>
                                <InputGroup>
                                    <AvInput name="email" placeholder="Enter your email " required
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
                                <Label for="pass"
                                    style={
                                        {color: "black"}
                                }>Password</Label>
                                <InputGroup >
                                    <AvInput 
                                    type={this.state.showPass===true?"text":"password"}
                                        name="pass"
                                        placeholder="Your Password goes here"
                                        required
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
                                <a href="/forgot">Forgot your password?
                                </a>
                            </AvGroup>
                            {this.state.replaceSubmit?<div><Spinner color="dark"  /></div>:<Button outline color="primary"
                              onClick={this.handleLoginSubmit} >Submit</Button>}
                            </AvForm>
                            </div>
                            </div>
                </Col>
                <Col></Col>
           </Row>
           </div>
        );
    }
}


export default AdminLogin;