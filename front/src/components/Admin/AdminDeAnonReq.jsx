import React, { Component } from 'react';

import {Container, Row, Col, Spinner, Button} from 'reactstrap';
import {Card, CardBody, CardFooter, CardHeader, CardText} from 'reactstrap';
import {FormGroup, Input, FormText, Label} from 'reactstrap';
import NavBar from '../NavBar/Navbar';
import Skeleton from 'react-loading-skeleton';
import next from '../../assets/next.png';
import check from '../../assets/check.png';
import remove from '../../assets/remove.png';
import api from '../../constants/api';


class AdminDeAnonReq extends Component {
    constructor(props){
        super(props);
        this.state={
            informationLoaded:false,
            isQueueEmpty:false,
            errMessage:"",
            err:false,
            user:null,
        }
    }
    UNSAFE_componentWillMount(){
        let url = api.backaddr + '/admin/deAnonReq';
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options).then(response=>response.json()).then(response=>{
            console.log("🚀 ~ file: AdminDeAnonReq.jsx ~ line 32 ~ AdminDeAnonReq ~ fetch ~ response", response)
            if(response.ok === 1){
            this.setState({informationLoaded:true, user:response.user[0]});
            }
        })
    }
    get_new_user_from_queue = ()=>{
        this.setState({informationLoaded:false})
        let url = api.backaddr + '/admin/deAnonReq';
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options).then(response=>response.json()).then(response=>{
            console.log("🚀 ~ file: AdminDeAnonReq.jsx ~ line 32 ~ AdminDeAnonReq ~ fetch ~ response", response)
            if(response.ok === 1){
            this.setState({informationLoaded:true, user:response.user[0]});
            }
        })
    }
    sendYesResponse=()=>{
        this.setState({informationLoaded:false})
        let url = api.backaddr+ '/admin/deAnonTrue';
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              token: localStorage.getItem("token").toString()
            },
            body: JSON.stringify({
             uid:this.state.user.user_id.toString()
            }),
          };
          fetch(url, options)
          this.get_new_user_from_queue();

    }
    sendNoResponse=()=>{
        this.setState({informationLoaded:false})
        let url = api.backaddr+ '/admin/deAnonFalse';
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              token: localStorage.getItem("token").toString()
            },
            body: JSON.stringify({
             uid:this.state.user.user_id.toString()
            }),
          };
          fetch(url, options)
          this.get_new_user_from_queue();
    }
    reFetchUser=()=>{
        this.setState({informationLoaded:false})
        
            let url = api.backaddr + '/admin/deAnonReq';
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        fetch(url, options).then(response=>response.json()).then(response=>{
            if(response.ok === 1){
               console.log("ReFEtCH : ", response.user)
            this.setState({informationLoaded:true, user:response.user[0]});
            }
        })
    }

    generateUser = ()=>{
        return(<div className="background-component" style={{minHeight:'80vh', height:'80vh',marginTop:"35px", borderRadius:'20px', padding:'10px'}}>
            <div className="" style={{minHeight:'400px', height:'66%', maxHeight:'66%'}}>
                  {this.state.informationLoaded &&  <img style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} src={api.cdn + api.deAnon.p1080 + this.state.user.mediaFile}></img>}
                  {!this.state.informationLoaded && <Skeleton height={500} count={1} className="skeleton-theme">
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
</Skeleton>}

            </div>
           
            <Row style={{marginTop:'25px'}}>
                <Col>
                {this.state.informationLoaded &&
                                     <FormGroup>
                                       <Label for="firstname" className="float-left"><span>First Name:</span></Label>
                                        <Input disabled type="text" name="firstname" id="first" value={this.state.user.firstName} />
                                        
                                        <br></br>
                                        <Label for="lastname" className="float-left"><span>Last Name:</span></Label>
                                        <Input disabled type="text" name="lastname" id="last" value={this.state.user.lastName} />
                                    
                                      </FormGroup>
                                      }
                                     {!this.state.informationLoaded && <div><Skeleton height={50} count={1} className="skeleton-theme"></Skeleton>
                                    
                                     <Skeleton height={50} count={1} className="skeleton-theme" style={{marginTop:'30px'}}></Skeleton>
                                     </div>
                                     }
                </Col>
                <Col>
                {this.state.informationLoaded &&
                <FormGroup>
                <Label for="country" className="float-left"><span>Country:</span></Label>
                                        <Input disabled type="text" name="country" id="country" value={this.state.user.country} />
                                        <br></br>
                                        <Label for="region" className="float-left"><span>Region:</span></Label>
                                        <Input disabled type="text" name="region" id="region" value={this.state.user.region} />
                                        </FormGroup>  }
                                        {!this.state.informationLoaded && <div><Skeleton height={50} count={1} className="skeleton-theme"></Skeleton>
                                                <Skeleton height={50} count={1} className="skeleton-theme" style={{marginTop:'30px'}}></Skeleton>
                                                </div>
                                                }       
                            </Col>
            </Row>
    
   
   
  
        </div>

        )
    }
   
    render() {
        return (
            <div className="background">
                <NavBar/>
                <div style={{minHeight:"95vh"}}>
                    <Row>
                        <Col className="" xl='2'></Col>
                        <Col className="">
                <Container>
                    <Row>
                        <Col>
                        <div style={{marginTop:'2vh'}}>
                          {this.generateUser()}
                        </div>
                        </Col>
                    </Row>
                </Container>
                </Col>
                <Col className=" d-flex justify-content-center" xl='2'>
                    <div className=" align-self-center">
                       <img className="icon-xlarge change-cursor" src={next} title="Don't give verdict on this case" onClick={()=>{this.get_new_user_from_queue()}}></img>
                       <br></br>
                       <img style={{marginTop:'10px'}}className="icon-xlarge change-cursor" src={check} title="Information corresponding" onClick={()=>{this.sendYesResponse()}}></img>
                       <br></br>
                       <img style={{marginTop:'10px'}}className="icon-xlarge change-cursor" src={remove} title="Information not corresponding" onClick={()=>{this.sendNoResponse()}}></img>
                    </div>
                </Col>
                </Row>
                </div>
            </div>
        );
    }
}

export default AdminDeAnonReq;


/**
 *  <img style={{width:'100%', height:'100%', objectFit:'cover'}} src={api.cdn + api.deAnon.p1080 + this.state.user.mediaFile }></img>
 */


/**
 * old generate user
 *  
    generateUser=()=>{
        return(
            <div className="background-component">
            <Card className="background-component" style={{borderRadius:'20px', padding:'20px'}}>
                <CardBody>
                    
                {!this.state.informationLoaded && <Spinner/>}
               {this.state.informationLoaded && (<div> <Row>
                    <Col>
                    <div style={{widht:'60vw', height:'50vh'}}>
                        <img style={{objectFit:'contain', width:'100%', height:'100%'}} src={api.cdn+api.deAnon.p1080+this.state.user.mediaFile} className="img-fluid"></img>
                    </div>
                    </Col>
                </Row>
                <Row className="" style={{marginTop:'2vh'}}>

                    <Col>
                    <CardText>
                    <div >
                    <FormGroup>
                                        <Label for="firstname" className="float-left">First Name:</Label>
                                        <Input disabled type="text" name="firstname" id="first" value={this.state.user.firstName} />
                                        <br></br>
                                        <Label for="lastname" className="float-left">Last Name:</Label>
                                        <Input disabled type="text" name="lastname" id="last" value={this.state.user.lastName} />
                                    
                                        </FormGroup>
                    </div>
                    </CardText>
                    </Col>
                    
                    <Col>
                    <div >
                    <Label for="country" className="float-left"><span>Country:</span></Label>
                                        <Input disabled type="text" name="country" id="country" value={this.state.user.country} />
                                        <br></br>
                                        <Label for="region" className="float-left"><span>Region:</span></Label>
                                        <Input disabled type="text" name="region" id="region" value={this.state.user.region} />
                                    
                    </div>
                   </Col>
                </Row>
              
               </div>)}
               </CardBody>

               <CardFooter>
                {this.state.informationLoaded && (
                    <div>
                          <div>
                    <p className="text-header2">Information corresponding?</p>
                </div>
                <Row>
                    <Col>
                    <div   className="change-cursor" onClick={()=>{this.sendYesResponse()}} style={{minHeight:'100px', minWidth:'100%', backgroundColor:'#00adb5',display:"flex", justifyContent:'center', alignItems:'center'}}>
                    <span className="text-header2" style={{}}>Yes</span>
                    </div>
                    
                    </Col>
                    <Col>
                    <div className="change-cursor justify-content-center align-content-center" onClick={()=>{this.sendNoResponse()}} style={{minHeight:'100px', minWidth:'100%', backgroundColor:'#ff2e63', display:"flex", justifyContent:'center', alignItems:'center'}}>
                           <span className="text-header2" style={{}}>No</span>
                    </div>
                    </Col>
                </Row>
                <Row style={{marginTop:'10px'}}>
                    <Col>
                    <Button onClick={this.reFetchUser}>Don't want to give verdict</Button>
                    </Col>
                </Row>
                </div>)}
                </CardFooter>
                </Card>
                </div>
        )
    }
 */