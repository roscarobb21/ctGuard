import { RedoOutlined } from '@material-ui/icons';
import {Container,Row,Col} from 'reactstrap';
import React, { Component } from 'react';
import NavBar from '../NavBar/Navbar';

import Carousel, {consts} from 'react-elastic-carousel';
import { InView } from 'react-intersection-observer';

import ctLogo from '../../assets/security.png';
import Video from 'react-responsive-video';
import api from '../../constants/api'

const queryString = require('query-string');

class ViewPostMedia extends Component {
    constructor(props){
        super(props);
        this.state={
            id:null, 
            page:null,
            media:null,
            postedByUsername:null,
            postedBy:null,
            header:null,
        }
    }
    componentWillMount(){
        const parsed = queryString.parse(location.search);
            this.setState({id:parsed.id || null , page:parsed.page || null})
    }
    componentDidMount(){
/**
 * Fetch media data
 */
        let url=api.backaddr+'/api/mediaLarge?id='+this.state.id
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
                    this.setState({media:response.media, postedByUsername:response.postedByUsername, header:response.header, postedBy:response.postedBy})
                }
                console.log("REsponse is ", response)
            })
    }


    imageItem = (med)=>{
        let path = api.cdn+ api.postMedia.p1080+med
        return(
            <div id="cauta"  style={{display:'flex',justifyContent:'center', alignItems:'center' ,minHeight:'90vh', minWidth:'100%', backgroundColor:'#303030'}}>
                <div className="align-self-center" style={{verticalAlign:'center'}}>

                <img src={path}></img>
                </div>
           
            </div>
        )
    }
    videoItem = (med, inView)=>{
        let path = api.cdn+ api.postMedia.p1080+med
        return(
            <div id="cauta"  style={{display:'flex',alignItems:'center',minHeight:'90vh', minWidth:'100%', backgroundColor:'#303030'}}>
            <Video
            
            controls
            autoplay={inView}
            muted={true}
            mp4={path}
            width={'100%'}
            height={'100%'}
            objectFit={`contain`}
            alt="Video Loading"
            />
       </div>
        )
    }
    
    
    
    
    mediaMap = (media, inView)=>{
        return media.map(element=>{
            if(element.split('.')[1]==='mp4'){
                //return video item
               return(this.videoItem(element))
            }else {
                //return img item
                return(this.imageItem(element))
            }
        })
    
    }
    
    generatePostCarousel = (media, inView)=>{
        if(media.length === 0){
            return(<div>This post has no media attached</div>)
        }
        return(
            <div style={{maxHeight:'75vh', minWidth:'100%'}}>
        <Carousel
            itemsToShow={1}
            showArrows={media.length===1?true:true}
            disableArrowsOnEnd={false}
            showArrows={true}   
            enableMouseSwipe={false}>
                { 
                this.mediaMap(media, inView)
                }
            </Carousel>
            </div>
        )
    }










    render() {
        console.log("THIS istate media ", this.state.media)
        if(this.state.id === null || this.state.media === null){
            return(<div>
                <NavBar/>
                <Container>
                    <Row>
                        <Col>
                        Wrong post id!
                        </Col>
                    </Row>
                </Container>
            </div>)
        }

        return(<div>
            <Container fluid>
                <Row style={{minHeight:'100vh'}} >
                    <Col  xs="12" sm="12" md="9" lg="10" xl="10" className="">
                        <div style={{padding:'20px'}}>
                    <InView>
                     {({ inView, ref, entry }) => (
                 <div ref={ref} style={{padding:''}}>
                                {this.generatePostCarousel(this.state.media, inView)}
                                 </div>
                      )}
                         </InView>
                         </div>
                    </Col>
                    <Col xs="12" sm="12" md="3" lg="2" xl="2" className="align-items-center justify-content-center p-0 border-left">
                        <div className="align-self-center">
                        <div style={{backgroundColor:'#393e46', padding:'10px'}}>
                        <img src={ctLogo} style={{width:'48px', height:'48px'}}></img> <span style={{color:'white'}}>ctGuard</span>
                        </div>
                        <div style={{marginTop:'30px'}}>
                            <p className="" style={{textAlign:'justify'}}><a href={'/post/'+this.state.id}>{this.state.header}</a></p>
                            <br></br>
                           <a href={'/user/'+this.state.postedBy}>@{this.state.postedByUsername}</a> 
                        </div>
                        </div>
                        
                    </Col>
                </Row>
                </Container>
        </div>)
    }
}

export default ViewPostMedia;
