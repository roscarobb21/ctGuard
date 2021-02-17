import React from 'react';
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


import api from '../../constants/api'
import FacebookLogin from 'react-facebook-login';

/**
 * TODO:
 * facebook login throw err if server unavailable
 * Error report button
 * 
 */
const LogInWithFacebook = ()=>{
return (
<div style={{position:'fixed', top:'0', right:'0%', zIndex:'10000'}}>

<FacebookLogin
    appId="859679134858810"
    autoLoad={false}
    fields="name,email,picture"
    onClick={()=>{console.log('onclick')}}
    callback={responseFacebook} />
</div>

)
}

const responseFacebook = (response) => {
    let token = response.accessToken;
    if(token !== undefined && token !== null && token !== ""){
     let url=api+'/fb'
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
        }
    }
    handleLoginSubmit=()=>{
        this.setState({replaceSubmit:true})
        let route='/login'
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
    
        let Urlresponse =  fetch(url, options).then(response => response.json())
        .then(response => {
            if(response){
                    localStorage.setItem("token", response.token)
                    window.location.replace('/profile')
            }
           
        }).catch(err=>{
          console.error('[Login] Fetch error : ', err.toString())
          this.setState({fetchModalVar:true, errText:err.toString()})
         })
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
        let email_header="Email validation"
        let pass_header="Pass validation"
        let good_header="Login Success"
        
        let email_body="The email you entered is not correct"
        let pass_body="The password you entered is not correct"
        let good_body="You will be redirected to your profile page"
        
        let unsuccess_header="Unable to log you in :(";
        let unsuccess_body="Password or email incorrect"
        return(
            <div className="login-page">
                <LogInWithFacebook/>
                <Modal isOpen={
                       this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }> {this.state.errNumber===1?email_header:this.state.errNumber===2?pass_header:this.state.errNumber===3?unsuccess_header:this.state.errNumber===null?good_header:"undefined"} </ModalHeader>
                    <ModalBody>
                    {this.state.errNumber===1?email_body:this.state.errNumber===2?pass_body:this.state.errNumber===3?unsuccess_body:this.state.errNumber===null?good_body:"undefined"}
                    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            onClick={
                                this.fetchModal
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

               <a href="/"> <p>← back to home</p></a>
           <Row>
                <Col></Col>
                <Col xs="12" sm="6" md="4">
                <div className="user-login-position">
                    <div className="fade-in">
                        <p className="text-header1">Log in into your account
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
                            {this.state.replaceSubmit?<div><Spinner color="dark" type="grow"/></div>:<Button outline color="primary"
                              onClick={this.handleLoginSubmit} >Submit</Button>}
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


export default Login;
