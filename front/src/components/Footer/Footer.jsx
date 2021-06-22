import React, {useState, useEffect} from 'react';
import {Container, Row, Col } from 'reactstrap';


import ctGuardLogo from '../../assets/security.png';
import api from '../../constants/api';
import "./Footer.css";

function Footer(props) {
    const [loged, setIsLoged] = useState(null);
    useEffect(async () => {
        let token = await localStorage.getItem("token");
        if(token === null || token === undefined || token.length === 0){
            setIsLoged(false);
            return;
        }
        let url = api.backaddr + '/api';

        let options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            "token": localStorage.getItem("token")
          }
        };
        try{
        let responseRaw = await fetch(url, options)
        let response = await responseRaw.json();
        console.log("🚀 ~ file: Footer.jsx ~ line 31 ~ useEffect ~ response", response)
        if(response.ok === 1){
            setIsLoged(true);
            
        }else {
            
            setIsLoged(false);
        }
        }catch(err){
            setIsLoged(false);
        }
        
        // Your code here
      }, []);   

    return (
        <div className="footer-main footer footer-header" style={{marginTop:'30px'}}>
            <Container>
                <Row className="" >
                    <Col md="12" lg="4" style={{marginTop:'30px'}}>
                    <p className="text-color " style={{textAlign:'left'}}>
                    Universitatea „Ștefan cel Mare” din Suceava
                    <br></br>
                    Str. Universitatii 13, 720229 Suceava, Romania
                    <br></br>
                    Rosca Roberto
                    <br></br>
                    3241a AIA
                    <br></br>
                    Email: roberto.rosca@student.usv.ro
                    <br></br>
                    GPS: 47° 38′ 29.03″ N | 26° 14′ 45.54″ E

                    </p>
                    </Col>
                    <Col md="12" lg="4" style={{marginTop:'30px'}}>
                        <div className="">
                        <img src={ctGuardLogo} className="icon-large"></img>
                        <p className="text-color" style={{}}>ctGuard. All rights reserved.</p>
                        </div>
                    </Col>
                    <Col md="12" lg="4">
                        {loged === false &&
                        <div>
                            <p className="text-color text-margin">ctGuard administration</p>
                            <hr></hr>
                            <a href="/admin/login" className="text-color text-margin">Administrator login</a>
                            <br></br>
                            <a href="/admin/register" className="text-color text-margin">Administrator register</a>
                        </div>}
                        {loged === true &&
                        <div>
                            <p className="text-color text-margin change-cursor" onClick={()=>{
                                window.location.assign("/settings")
                            }} >Settings</p>
                            <p className="text-color text-margin">FAQ</p>
                            <p className="text-color text-margin change-cursor" onClick={async()=>{
                                await localStorage.removeItem("token");
                                window.location.assign("/login");
                            }}>Log out</p>
                        </div>
                        }
                          {loged === null &&
                        <div>
                            <p className="footer-text-color text-margin">ctGuard administration</p>
                            <hr></hr>
                            <a href="/admin/login" className="footer-text-color text-margin">Administrator login</a>
                            <br></br>
                            <a href="/admin/register" className="footer-text-color text-margin">Administrator register</a>
                        </div>}
                    </Col>
                    
                </Row>
              
            </Container>
        </div>
    );
}

export default Footer;