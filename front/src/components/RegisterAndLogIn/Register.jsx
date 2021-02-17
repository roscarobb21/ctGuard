import React , {Component } from 'react';
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

import eye from '../../assets/eye.png'
import './RegisterAndLogin.css'
 


  /**
   * Register page component
   */
class Register extends Component{
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
    handleModal=()=> {
        this.setState({
            closeModal: !this.state.closeModal
        })
        if(this.state.finish){
        window.location.replace('/home')
        }
    }
    SubmitRegisterRequest=()=>{
        this.setState({replaceSubmit:true})
        let success=1;
if(document.getElementById("email").value==="")
        {
            this.setState({errNumber:1, closeModal:true})
            return
        }
        if(document.getElementById("pass").value==="")
        {
            this.setState({errNumber:2, closeModal:true})
            return
        } 
        if(document.getElementById("username").value==="")
        {
            this.setState({errNumber:5, closeModal:true})
            return
        } 
        if(document.getElementById("confirm").value==="" || document.getElementById("confirm").value!==document.getElementById("pass").value )
        {
            this.setState({errNumber:3, closeModal:true})
            return
        } 
        let url=api+'/signup'
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
              username: document.getElementById("username").value
            }),
          };

          let Urlresponse =  fetch(url, options).then(response => response.json()).catch(err=>{console.log("my custom err : ", err);this.setState({fetchModalVar:true, errText:err.toString()})})
          .then(response => {
          
              if(response){
                  if(response.user=="email")
                  {this.setState({errNumber:"taken", closeModal:true, finish:false})
                return;}
                if(response.user=="username"){
                     {this.setState({errNumber:"username", closeModal:true, finish:false})}
                     return;
                }

          this.setState({errNumber:null, closeModal:true, finish:true})
  
          window.location.replace('/login')
  
          return
              }
          })
      


    }
    fetchModal=()=>{
        this.setState({fetchModalVar:!this.state.fetchModalVar})
    }
    okErrButton=()=>{
        window.location.reload();
    }
    render(){
        let error=this.state.errNumber;
        let email_header="Email validation" //1
        let old_email_header="Email validation" //4
        let pass_header="Pass validation" //2
        let confirm_header="Confirm Pass validation" //3
    
        let good_header="Register Success"

        let email_body="The email you entered is not correct"
        let old_email_body="User with this email already exists"
        let pass_body="The password you entered is not correct"
        let good_body="You will be redirected to your profile page"
        let confirm_body="Passwords do not match"
        let unsuccess_header="Unable to log you in :(";
        let unsuccess_body="Password or email incorrect"
        let email_taken_body="Email already taken"
        let username_header="Username validation";
        let username_body="Username provided not unique or correct";

        return(
            <div>
                <Modal isOpen={
                       this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                        
                    }> {error===1?email_header:error===2?pass_header:error===3?confirm_header:error===4?old_email_header:error===5?username_header:error===null?good_header:error==="taken"?email_header:error==="username"?username_header:"undefined"} 
                    </ModalHeader>
                    <ModalBody>
                    {error===1?email_body:error===2?pass_body:error===3?confirm_body:error===4?old_email_body:error===5?username_body:error===null?good_body:error==="taken"?email_taken_body:error==="username"?username_body:"undefined"}
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.handleModal
                        }>Ok, got it!</Button>
                    </ModalFooter>
                </Modal>
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
            <Row>
            <Col></Col>
            <Col xs="12" sm="6" md="4">
                <div className="user-login-position">
                    <div className="fade-in">
                        <p className="text-header1">Are you ready? Register now :
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
                                    <AvInput name="email" placeholder="Your email goes here" required
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
                                {this.state.replaceSubmit?<div><Spinner type="grow" color="dark" /></div>:<Button outline color="primary"
                            onClick={this.SubmitRegisterRequest}
                               >Register</Button>}
                            
                        </AvForm>
                    </div>
                </div>
            </Col>
            <Col></Col>
        </Row>
        </div>

        )
    }

}










export default Register;

