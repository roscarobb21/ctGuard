import React, { Component } from 'react';
import {Container, Row, Col} from 'reactstrap'

import {Spinner} from 'reactstrap'
import ctGuardLogo from '../../assets/security.png';
import congrats from '../../assets/congrats.png'
import sad from '../../assets/sad.png';
import Footer from '../Footer/Footer'
import api from '../../constants/api'
class Confirm extends Component {
    constructor(props){
        super(props)
        this.state={
            token:null,
            confirmed:false,
            err:false,
            loading:true,
            errMsg: ""
        }
    }
    UNSAFE_componentWillMount(){
        let token = this.props.location.pathname.split('/')[2]
        this.setState({token:token})
        let url = api.backaddr+'/confirm/?token='+token;
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "multipart/form-data",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
            },
        };
        fetch(url, options).then(response=>response.json()).then(response=>{
            if(response.ok === 1){
                this.setState({loading:false})
            }else if(response.ok === 0){
                this.setState({loading:false, err:true, errMsg : response.err})
            }
        })

    }

    render() {
        return (
            <div>
            <div style={{minHeight:'90vh', minWidth:'100vw'}} className="background">
                 <div className="forgot-header-wrapper" style={{backgroundColor:"#393e46"}}>
                    <div className="change-cursor" onClick={()=>{window.location.assign('/')}}> 
                    <Row>
                        <Col>
                <img style={{width:'100px', height:'100px', padding:'10px'}} src={ctGuardLogo}></img>
                </Col>
                </Row>
                <Row>
                    <Col>
                    <p className="text-header2 text-white-always">ctGuard</p>
                    </Col>
                </Row>
                </div>
                </div>
                <div className="background" style={{minWidth:'100%', minHeight:'100%'}}>
                    <Container
                    style={{marginTop:'30px', minHeight:'66%', borderRadius:'20px'}}
                    className="background-component"
                    >
                        {!this.state.loading && !this.state.err &&
                        <div  style={{ minHeight:'100%', padding:'20px'}}>
                            <img className="icon-xlarge" style={{padding:'20px'}}src={congrats}></img>
                            <span className="text-header2">Email confirmed! Proceed to <a href="/login">log in</a>.</span>
                        </div>}
                        {this.state.loading && 
                        <div  style={{ minHeight:'100%', padding:'20px'}}>
                       <Spinner color="primary"/>
                    </div>
                        }
                          {!this.state.loading && this.state.err &&
                        <div  style={{ minHeight:'100%', padding:'20px'}}>
                        <img className="icon-xlarge" style={{padding:'20px'}}src={sad}></img>
                            <span className="text-header2">Link not available</span>
                    </div>
                        }
                    </Container>
                </div>

                </div>
              
                <Footer/>
                </div>
        );
    }
}

export default Confirm;