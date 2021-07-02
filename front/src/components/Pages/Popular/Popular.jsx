import React, { Component, useRef } from 'react';
import {Container, Row, Col, Spinner} from 'reactstrap';

import { ListGroup, ListGroupItem } from 'reactstrap';
import NavBar from '../../NavBar/Navbar';

import api from '../../../constants/api';
import flame from '../../../assets/flame.png';
import topArrow from '../../../assets/toparrow.png';

import Skeleton from 'react-loading-skeleton';
import Blink from 'react-blink-text';
import Footer from '../../Footer/Footer';
import './Popular.css';

class Popular extends Component {
    constructor(props){
        super(props)
        this.state={
            containerHeight:null,
            listHeight:null,
            country:"",
            region:"",
            datePopular:"",
            postsId:[],
            posts:null,
        }
        this.containerElement = React.createRef();
    }
    UNSAFE_componentWillMount(){
        let url = api.backaddr + api.authUser + api.routes.popular ;
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
        console.log("🚀 ~ file: Popular.jsx ~ line 31 ~ Popular ~ fetch ~ response", response)
            if(response.ok === 1){
                this.setState({country:response.Popular[0].country, region:response.Popular[0].region, datePopular: response.Popular[0].datePopular, postsId:response.Popular[0].postsId, posts:response.Posts})
            }
        })
    
    }
    componentWillUnmount(){
        window.removeEventListener('resize', this.handleResize)
    }
    handleResize = ()=>{
        const height = document.getElementById("popular-container").clientHeight
        this.setState({ containerHeight : height });
    }
    componentDidMount(){
        window.addEventListener('resize', this.handleResize)
        const height = document.getElementById("popular-container").clientHeight

        this.setState({ containerHeight : height, listHeight: height*0.6 });
    }
    
    generateListElements = ()=>{
        return this.state.posts.map((element, i)=>{
            return(
                <ListGroupItem 
                className="change-cursor popular-list-item card-footer-accent"
                onClick={()=>{window.location.assign("/post/"+element._id.toString())}}
                style={{marginTop:'20px'}}>
                    <div>
                        <div className="float-left">
                            <img src={i<=2?flame:topArrow} style={{width:'32px', height:'32px'}}></img>
                            &nbsp;<span> {element.upVotes} </span>&nbsp;
                            <span>{element.header.length>50?element.header.substring(0,50)+'...':element.header}::</span>
                            <span style={{color:element.category==="Request"?"#00adb5":element.category==="Incident"?"#ff2e63":"black"}}>{element.category}</span>
                            </div>
                  <div className="float-right"><span>@{element.postedByUsername}</span></div>
                    </div>
                </ListGroupItem>
            )
        })

        
    
    }

    generateTopList = ()=>{
        if(this.state.posts !== null){
        return(
        <ListGroup>
            {this.generateListElements()}
        </ListGroup>
        )
        }
        return(
            <div>
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
                <Skeleton className="skeleton-theme" style={{marginTop:'20px'}} height={50} count={1} />
            </div>
        )
    }

    render() {
        console.log("Posts height: ", this.state.posts)
        return (
            <div className="background">
                <NavBar/>
               <Container
               style={{minHeight:'80vh'}}
               id="popular-container"
               ref={ (containerElement) => { this.containerElement = containerElement } }
               >
                   <Row>
                       <Col>
                       <div className="popular-presentation background-component">
                                <div className="popular-title">
                                        <p className="text-header1" style={{marginTop:'10px'}}>The most popular posts on ctGuard</p>
                                </div>
                                <hr></hr>
                                <div>
                                  <p >Latest update : <span className="true-accent-always">{this.state.datePopular}</span> &nbsp; Country:&nbsp;<span className="false-accent-always">{this.state.country}</span></p>
                                    </div>
                                    <div className="wrapper">
                               <div className="list-location" style={{overflowY:'scroll', marginTop:'20px', minHeight:this.state.listHeight, maxHeight:this.state.listHeight}}>
                                   {this.generateTopList()}
                                   <div id="scroll-text">
                              <Blink color='#08d9d6' text='↓ scroll' fontSize='40'/>
                              </div>
                               </div>
                               </div>
                             
                       </div>
                           </Col>
                       </Row>
                   </Container>
                   <br></br>
              
                   <Footer/>
            </div>
        );
    }
}

export default Popular;