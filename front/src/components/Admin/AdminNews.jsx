import React, { Component } from 'react';
import {Container,Row, Col} from 'reactstrap';

import { Button, Form, FormGroup, Label, Input, FormText , Spinner} from 'reactstrap';

import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';

import api from '../../constants/api'

import NavBar from '../NavBar/Navbar';
import Footer from '../Footer/Footer';
import './Admin.css';

const countries = [{title:"Global"},{title:"Romania"}, {title:"USA"}]
const region = [{title:"Global"},{title:"Suceava"}, {title:"Bucuresti"}, {title:"Iasi"}]
class AdminNews extends Component {
    constructor(props){
        super(props)
        this.state={
            country:"",
            region:"",
            countryErr:"",
            regionErr:"",
            countryOpen:false,
            showNewsText:false,
            newsType:"Urgent",
            newsLengh:0,
            newsText:"",
            replacePushButton:false
        }
    }
    mountedStyle = { animation: "inAnimation 500ms ease-in" };
    unmountedStyle = { animation: "outAnimation 510ms ease-in" };
  
    selectCountry= (val)=>{
        this.setState({country:val})
    }
    selectRegion = (val)=>{
    console.log("🚀 ~ file: AdminNews.jsx ~ line 35 ~ AdminNews ~ val", val)
        
        if(this.state.country.length >= 0 && val.length >= 0){
            this.setState({region:val, showNewsText:true})
        }
        if(val.length === 0){
            this.setState({showNewsText:false})
        }
    }

    handleNewsPush = ()=>{
        this.setState({replacePushButton:true})
        if(this.state.newsText.length === 0){
            this.setState({replacePushButton:false})
            return
        }
        let url = api.backaddr + api.admin + api.adminRoutes.pushNews;
        console.log("🚀 ~ file: AdminNews.jsx ~ line 54 ~ AdminNews ~ url", url)
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              token:    localStorage.getItem("token"),
            },
            body: JSON.stringify({
              country:this.state.country,
              region:this.state.region,
              type:this.state.type,
              text:this.state.newsText
            }),
          };
          fetch(url, options).then(response=>{
              this.setState({replacePushButton:false});
              window.location.reload()
          })
    }

    render() {
        return (
            <div className="background">
                <NavBar/>
                <Container>
                    <Row>
                        <Col>
                        <div className="admin-news-container background-component">
                         <Row>
                             <Col>
                             <p className="text-header1">Push news to users notifications</p>
                             </Col>
                         </Row>
                       <Row style={{}}>
                           
                           <Col>
                           <FormGroup >
                                    <Label for="country" className="settings-left float-left"><span>Country</span></Label>
                                  
                                    <CountryDropdown
                                        className="country-drop highlight"
                                        value={this.state.country}
                                        showDefaultOption={true}
                                        whitelist="RO"
                                        onChange={(val) => this.selectCountry(val)} />
                                        <FormText color="muted" className="text-justify">
                                        Country to push the news
                                        </FormText>
                                  
                                    </FormGroup>
                                    </Col><Col>
                                    <FormGroup >

                                    <Label for="region"className="settings-left" className="float-left"><span>Region</span></Label>
                                   
                                    <RegionDropdown
                                        className="region-drop highlight"
                                        country={this.state.country}
                                        value={this.state.region}
                                        onChange={(val) => this.selectRegion(val)} />
                                        <FormText color="muted" className="text-justify">
                                        Region to push the news
                                        </FormText>
                                    
                                    </FormGroup>
                                    </Col>
                         <Col>
                                            <FormGroup>
                                            <Label for="type" className="float-left"><span>News type</span></Label>
                                            <Input type="select" name="type" id="type" 
                                            className="no-padding"
                                            onChange={val=>{this.setState({newsType:val})}}
                                            >
                                            <option value="Urgent">Urgent</option>
                                            <option value="Alert">Alert</option>
                                            <option value="Incident">Incident</option>
                                            <option value="Request">Request</option>
                                            </Input>
                                        </FormGroup>
                          </Col>

</Row>




                    <Row style={{marginTop:'60px'}}>
                        <Col style={{padding:'20px'}}>
                        <div style={{opacity:this.state.showNewsText?1:0}}>
                        <FormGroup>
                            <Label for="news" className="float-left"><span>News Text</span></Label>
                            <Input type="textarea" name="news" id="news-text-area" 
                            spellCheck="false"
                            value={this.state.newsText}
                            maxLength="250"
                            onChange={evt=>{this.setState({newsText:evt.target.value, newsLengh:evt.target.value.length})}}
                            />
                            <FormText muted className="float-right"><span style={{color:this.state.newsLengh===250?"red":"black"}}>{this.state.newsLengh}</span>/250</FormText>
                        </FormGroup>
                        </div>
                        </Col>
                    </Row>


                        { this.state.showNewsText &&
                        <Row>
                            <Col>
                            <div className="float-right">
                           {this.state.replacePushButton &&<Spinner/>} 
                           {!this.state.replacePushButton && 
                            <Button color="primary" onClick={this.handleNewsPush}>Push</Button>
                           }
                          
                            </div>
                            </Col>
                        </Row>
                            }
    
                            </div>
                        </Col>
                    </Row>
                </Container>
                <Footer/>
            </div>
        );
    }
}

export default AdminNews;

