import React, {useEffect, useState} from 'react';
import {Row, Col} from 'reactstrap';
import {Link} from 'react-router-dom'
import profileImg from '../../assets/ProfileImg.png'
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    FormGroup,
    Label,
    Input,
    FormText 
} from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-medium-image-zoom/dist/styles.css';
import ImageUploader from 'react-images-upload';
import NavBar from '../NavBar/Navbar';
import Footer from '../Footer/Footer';
import {
    MapContainer,
    TileLayer,
    Marker,
} from 'react-leaflet'
import api from '../../constants/api';


import { Progress } from 'reactstrap';
import {InView} from 'react-intersection-observer';


import myPostsImg from '../../assets/myposts.png';
import locationImg from '../../assets/locationImg.png';
import achivementsImg from '../../assets/objective.png';

import Showcase from '../Achivements/Showcase';

import './Profile.css'


import BatImg from '../../assets/1.jpg';
import PostItem from '../PostItem/PostItem';
import { KeyboardReturn, KeyboardReturnRounded } from '@material-ui/icons';
import PostItemScheleton from '../PostItem/PostItemScheleton';

const random = require("simple-random-number-generator");
class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 1,
            isLoading: true,
            setActiveTab: 1,
            username: null,
            posts: null,
            pictures: [],
            avatarUrl: null,
            closeModal: false,
            country: null,
            region: null,
            latitude: null,
            longitude: null,
            showMap: false,
            upVoted: null,
            follow: null,
            update: false,
            showcase:null,
            newBio:null,
            bio:null,
            changeBio:false,
        }
        this.onDrop = this.onDrop.bind(this);
        this.uploadImg = this.uploadImg.bind(this);
    }


    async uploadImg() {
        if (this.state.pictures !== []) {
            const data = new FormData();
            data.append('avatar', this.state.pictures[0]);

            let url = api.backaddr + '/api/profileAvatar'
            let options = {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                },
                body: data
            };
            delete options.headers['Content-Type'];
            let urlFetch = await fetch(url, options);
            window.location.reload();
        }
    }

    onDrop(picture) {

        this.setState({pictures: picture});

    }
    async fetchUserPosts() {
        let url = api.backaddr + '/api/posts'
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let responseRaw = await fetch(url, options);
        let response = await responseRaw.json();
        if (response.ok == 1) {
            return response.posts
        } else {
            alert('Something is not ok with the backend server')
        }

    }


    async componentWillMount() { /**User data fetch */
        const pos = await navigator.geolocation.getCurrentPosition((position) => {
            console.log('position : ', position)
            console.log("Latitude is :", position.coords.latitude);
            console.log("Longitude is :", position.coords.longitude);
            sessionStorage.setItem('lat', position.coords.latitude)
            sessionStorage.setItem('long', position.coords.longitude)
            let url = api.backaddr + api.authUser +'/setLocation?lat='+position.coords.latitude+'&lon='+position.coords.longitude;
            let options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                }
            };
            fetch(url, options)
        });

        let url = api.backaddr + '/api'
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let responseRaw = await fetch(url, options);
        let response = await responseRaw.json();
        if (response.ok == 1) {
            
            let postsData = await this.fetchUserPosts();
            this.setState({
                username: response.user.username,
                posts: postsData,
                avatarUrl: response.user.avatarUrl,
                country: response.user.country,
                region: response.user.region,
                upVoted: response.user.upVoted,
                follow: response.user.following,
                showcase:response.user.showcase,
                bio:response.user.bio,
                newBio:response.user.bio
            })
        } else {
            alert('Something is not ok with the backend server')
        }


    }

    componentDidMount() {

        if (sessionStorage.getItem('lat') !== null && undefined) {
            this.setState({activeTab: 1, isLoading: false, showMap: true})
            return
        }
        this.setState({activeTab: 1, isLoading: false})
    }

    toggle = tab => {
        if (this.state.activeTab !== tab) 
            this.setState({activeTab: tab});
        


    }


    newGenerateMyPostsCards = (posts) => {

        if (this.state.posts === null || this.state.posts.length === 0) {
            return (
                <div className="background-component" style={{display:'flex', minHeight:'350px', width:'100%', borderRadius:'20px', marginTop:'20px', marginBottom:'20px'}}>
                <p className="align-self-center text-header2" style={{marginLeft:'auto', marginRight:'auto'}}>You didn't post anything yet</p>
            </div>
            )
        }
        console.log("NEW GENERATE ", posts)
        return(this.state.posts.map(post => {
            console.log("POST MAPPED NOW IS ", post)
            return (
                <PostItem post={post}/>
            )
        }))

    }


    handleModal = () => {
        this.setState({
            closeModal: !this.state.closeModal
        })
    }
    selectCountry(val) {
        this.setState({country: val});
    }

    selectRegion(val) {
        this.setState({region: val});
    }
    
    changeBioFetch = ()=>{
        let url=api.backaddr+api.authUser+ api.routes.changeBio
        let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              token:localStorage.getItem("token")
            },
            body: JSON.stringify({
              bio: this.state.newBio,
            }),
          };
          fetch(url, options)
          this.setState({bio:this.state.newBio.trim(), changeBio:false})
          
    }

    changeBioComponent = ()=>{ 

        if(this.state.changeBio){
            return(<div>
                <FormGroup>
                <Input type="textarea" name="bioText" id="bioText" value={this.state.newBio}
                style={{resize:'none'}}
                onChange={(evt)=>{this.setState({newBio:evt.target.value})}}
                maxLength="250"
                spellCheck="false"
                />
                   <FormText className="float-right" >
                <span style={{color:this.state.newBio.length===250?"#ff2e63":"#222831"}} ><span className={this.state.newBio.length===250?"blinker":""}>{this.state.newBio.length}</span>/250</span>
        </FormText>
              </FormGroup>
              
              <Button color="primary" onClick={()=>{this.changeBioFetch()}}>Save</Button>
              &nbsp;
              <Button color="danger" onClick={()=>{this.setState({changeBio:false})}}>Cancel</Button>
              </div>
            )
        }
    }

    retBio=()=>{
        let params = {
            min: 1,
            max: 3,
            integer: true
          };
          let count = random(params);
          let height;
          switch (count){
              case 1:
                  height=35;
                  break;
                case 2:
                    height=20;
                    break;
                case 3:
                    height=15;
                    break;
          }
        if(this.state.bio === null){
            return(<Skeleton height={height} className="skeleton-theme" count={count}/>)
        }

        return(
            this.state.bio?.length===0?<span onDoubleClick={()=>{this.setState({changeBio:true})}} className="change-cursor ">Double click to set bio</span>:<span onDoubleClick={()=>{this.setState({changeBio:true})}} className="change-cursor" title="Double click to change bio">{this.state.bio}</span>
        )
    }

    render() {
        const position = [51.505, -0.09]
        console.log('this.state.username', this.state.country)
        const {country, region} = this.state;
        if (this.state.isLoading) {
            return null;
        }


        return (
                <div>
            <div className="profile background" style={{minHeight:'100vh'}}>

                <Modal
                isOpen={
                        this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }>
                        <span>Change Profile Picture</span>
                    </ModalHeader>
                    <ModalBody>
                        <ImageUploader withIcon={true}
                            buttonText='Choose images'
                            onChange={
                                this.onDrop
                            }
                            imgExtension={
                                ['.jpg', '.gif', '.png', '.gif']
                            }
                            maxFileSize={5242880}
                            withPreview={true}
                            singleImage={true}/>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="danger"
                            onClick={
                                () => {
                                    this.setState({closeModal: false})
                                }
                        }>Cancel</Button>
                        <Button color="primary"
                            onClick={
                                () => {
                                    this.uploadImg();
                                    this.handleModal();
                                }
                        }>Ok!</Button>
                    </ModalFooter>
                </Modal>


                <NavBar items={
                    this.state.avatarUrl
                }/>
                <div className="background">
                    <Row>
                        <Col md="0" lg="3"></Col>
                        <Col md="12" lg="6" className="profile-container background">
                            <div style={
                                {
                                    
                                    padding: '30px 0px 20px 0px',
                                    borderRadius: '20px'
                                }
                            }
                            className="background-component"
                            >
                                   <Row>
                            <Col className="" xs="12" md="12" lg="12" xl="4">
                        <div className="float-md-none float-lg-none float-xl-left ml-lg-4">
                            {this.state.avatarUrl === null && <Skeleton className="skeleton-theme profile-img-stranger" circle={true} height={200} width={200}/>}
                            {this.state.avatarUrl !== null &&
                            <img src={
                                        this.state.avatarUrl === null ? api.cdn+api.avatarMedia.p1080+"default.jpg" : api.cdn + api.avatarMedia.p1080 + this.state.avatarUrl
                                    }
                                    className="profile-img-stranger change-cursor"
                                    title={this.state.username}
                                    onClick={
                                        this.handleModal
                                }></img>}
                                {this.state.username && <p className="text-header2">@{this.state.username}</p>}
                                {this.state.username=== null && <Skeleton className="skeleton-theme" height={10}/>}
                                </div>
                        </Col>
                        <Col className=""   xs="12" md="12" lg="12" xl="8" style={{padding:'0px 50px 0px 50px'}}>
                        <div className="float-xs-none float-sm-none float-md-none float-lg-none float-xl-left background-component-level-1" style={{ borderRadius:'20px', minHeight:"100px", textAlign:'left', minWidth:'100%', padding:'20px', maxHeight:'250px', overflow:'scroll'}}>
                       <div className="" style={{textAlign:'left'}}>
                           {this.state.changeBio?this.changeBioComponent():this.retBio()}
                           </div>
                        </div>

                        </Col>
                        </Row>
                                <div id="profile-showcase" className="" style={{width:'100%', marginTop:'10px'}}>
                                    <Row>
                                        <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                        <Col xs="12" sm="12" md="4" lg="4" xl="4">
                                    <Showcase showcase={this.state.showcase!==null?this.state.showcase:null}/>
                                    </Col>
                                    <Col xs="0" sm="0" md="4" lg="4" xl="4"></Col>
                                    </Row>
                                </div>
                            </div>

                            <div style={
                                {paddingTop: '20px'}
                            }>
                                <Tabs fill id="controlled-tab-example "
                                    className="text-color"
                                    mountOnEnter={true}
                                    unmountOnExit={true}
                                    activeKey={
                                        this.state.activeTab
                                    }
                                    onSelect={
                                        (k) => this.setState({activeTab: k})
                                }>
                                    <Tab 
                                    eventKey="1" 
                                    title=
                                    {
                                        <span className="text-color-inverted-profile"><img src={myPostsImg} className="img-tab"></img>&nbsp;My posts</span>
                                    }
                                        onEnter={
                                            () => {}
                                    }>
                                        {
                                        this.state.posts && this.newGenerateMyPostsCards(this.state.posts)
                                    } 
                                    {this.state.posts === null && <PostItemScheleton/>}
                                    </Tab>
                                    <Tab  eventKey="2" title=
                                    {<span>
                                        <img src={locationImg} className="img-tab"></img>&nbsp;Location
                                    </span>}
                                    >
                                        <div>
                                                <div className="background-component" style={{padding:'10px', marginTop:'30px', borderRadius:'20px', marginBottom:'30px'}}>
                                                <div style={{marginTop:'30px'}}>
                                                <p className="text-header2 text-color">Your location is : {
                                                    this.state.country
                                                }, {
                                                    this.state.region
                                                }</p>
                                            </div>
                                            <div id="map-container">
                                                <MapContainer center={
                                                        [
                                                            sessionStorage.getItem('lat') !== null ? sessionStorage.getItem('lat') : "",
                                                            sessionStorage.getItem('long') !== null ? sessionStorage.getItem('long') : ""
                                                        ]
                                                    }
                                                    zoom={13}
                                                    scrollWheelZoom={false}>
                                                    <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                                    <Marker position={
                                                        [
                                                            sessionStorage.getItem('lat') !== null ? sessionStorage.getItem('lat') : "",
                                                            sessionStorage.getItem('long') !== null ? sessionStorage.getItem('long') : ""
                                                        ]
                                                    }></Marker>
                                                </MapContainer>
                                            </div>
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab  eventKey="3" title={
                                        <span><img src={achivementsImg} className="img-tab"></img>&nbsp;Achivements</span>
                                    }
                                    >
                                        <Achivements/>
                                    </Tab>
                                </Tabs>
                            </div>
                        </Col>
                        <Col md="0" lg="3"></Col>
                    </Row>
                <div>
                </div>
                </div>
            </div>
            <Footer/>
            </div>
        )
    }
}

let Achivements = ()=>{
    const [postPoints, setPostPoints]= useState(0);
    const [allAchivements, setAllAchivements] = useState(null);
    const [myAchivements, setMyAchivements] = useState(null);
    /*
    fetch user achivements
    */
   useEffect( async ()=>{
       if(allAchivements === null && myAchivements === null){
    let url = api.backaddr + api.achivements;
    let options = {
     method: "GET",
     headers: {
         "Content-Type": "application/json",
         "Cache-Control": "no-cache, no-store, must-revalidate",
         Pragma: "no-cache",
         token: localStorage.getItem("token").toString()
      }
     };  
     const responseRaw = await fetch(url, options);
     const response = await responseRaw.json();
     setPostPoints(response.postPoints);
     setAllAchivements(response.achivements);
     setMyAchivements(response.my);
    }
   })
  

    return(
        <div>
        <div className="background-component" style={{marginTop:'2vh', borderRadius:'20px', padding:'20px'}}>
            <p className="text-header2">Your postPoints : {postPoints}</p>
        </div>
        <AchivMap points={postPoints} allAchivements={allAchivements} myAchivements={myAchivements}/>
   
        </div>
    )
}

let AchivMap = (props)=>{
    let all = props.allAchivements;
    let my = props.myAchivements;
    let points = props.points;
  
    if(all !== null){
    return all.map(element=>{
        return <Achivement element={element} my={my} points={points}/>
    })
        }
        return(<SkeletonAchivement/>)
}


let Achivement = (props)=>{
console.log(" ACHIVEMENTS PROPS : ", props);
let achiv = props.element;
let my = props.my;
let points = props.points;
let progress;

if(achiv.points === 0 || points >= achiv.points){
    progress = 100;
}else {
    progress = points * 100 /achiv.points;
}


let text = ["Nice start", "Nice start", "Keep Going", "Keep Going", "Making progress", "Making progress", "Making serious progress", "You're almost there", "You're almost there", "Achieved!"];
let color = ["primary", "primary", "info", "info", "info", "warning", "warning", "warning", "success", "success"];
var quotient = Math.floor(progress/10) - 1;


if(achiv !== null && my !== null){
return(<div className="background-component" style={{padding:'30px', marginTop:'2vh', borderRadius:'20px', opacity:(my.includes(achiv._id.toString()) || points>achiv.points)?'1':'0.5'}}>
    <Row className="align-items-center">
        <Col sm="12" md="12" lg="4" xl="4">
        <img src={api.cdn+'/'+achiv.media[0]} style={{width:'150px', height:'150px', borderRadius:'20px'}} className="align-items-center" className={(my.includes(achiv._id.toString()) || points>achiv.points)?'':'gray'}></img>
        </Col>
        <Col sm="12" md="12" lg="8" xl="8">
        <p className="text-header2 align-items-center" style={{padding:'20px'}}>{achiv.name}</p>
        <p className="text-color text-muted">{achiv.description}</p>
        </Col>
    </Row>
    <Row style={{marginTop:'1vh'}}>
        <Col>
        <Progress animated color={color[quotient]} value={progress}>{text[quotient]} </Progress>
        </Col>
    </Row>
    </div>
    )
}
return(<SkeletonAchivement/>)
}


let SkeletonAchivement = (props)=>{
    return(<div className="background-component" style={{padding:'30px', marginTop:'2vh', borderRadius:'20px', minHeight:'300px'}}>
        <Row className="align-items-center">
            <Col sm="12" md="12" lg="4" xl="4">
            <div style={{minWidth:'100%'}}>
            <Skeleton className="skeleton-theme" count={1} height={150} width={'100%'}/>
            </div>
            </Col>
            <Col sm="12" md="12" lg="8" xl="8">
            <div style={{minWidth:'100%'}}>
            <Skeleton className="skeleton-theme" count={1} height={150} width={'100%'}/>
            </div>
            </Col>
        </Row>
        <br></br>
        <Row style={{marginTop:'2vh'}}>
            <Col>
            <Skeleton className="skeleton-theme" height={15} count={1}/>
            </Col>
        </Row>
        </div>
        )
    
    }


export default Profile;

