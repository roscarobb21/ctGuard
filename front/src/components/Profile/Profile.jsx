import React, {useState} from 'react';
import {Row, Col} from 'reactstrap';
import {Link} from 'react-router-dom'
import profileImg from '../../assets/ProfileImg.png'
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Card,
    Button,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';



import ImageUploader from 'react-images-upload';
import classnames from 'classnames';
// import Carousel from 'react-instagram-carousel';
import NavBar from '../NavBar/Navbar'

import {
    MapContainer,
    Map,
    TileLayer,
    Marker,
    Popup
} from 'react-leaflet'
import {CountryDropdown, RegionDropdown, CountryRegionData} from 'react-country-region-selector';
import Geocode from "react-geocode";
import api from '../../constants/api';
import PostItem from './PostItem'
import './Profile.css'






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
            upVoted:null,
            follow: null, 
        }
        this.onDrop = this.onDrop.bind(this);
        this.uploadImg = this.uploadImg.bind(this);
    }


    async uploadImg() {
        if (this.state.pictures !== []) {
            const data = new FormData();
            data.append('avatar', this.state.pictures[0]);

            let url = api + '/api/profileAvatar'
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
        let url = api + '/api/posts'
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
            console.log('posts are ', response.posts)
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
        });

        let url = api + '/api'
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
            console.log('user data : ', response)
            this.setState({
                username: response.user.username,
                posts: postsData,
                avatarUrl: response.user.avatarUrl,
                country: response.user.country,
                region: response.user.region,
                upVoted:response.user.upVoted,
                follow: response.user.following,
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

    generateMyPostsCards = (posts) => { // fetch my latest posts
        if (this.state.posts === null || this.state.posts.length === 0) {
            return (
                <div>
                    <p>You don't have any posts yet</p>
                </div>
            )
        }
        return this.state.posts.map((post) => {
            let liked= this.state.upVoted.includes(post._id.toString())?true:false;
            let follow= this.state.follow.includes(post._id.toString())?true:false;
            post.upVoted=liked
            post.follow= follow
            return (
                <div>
                    <div className="my-post-item">
                        <Row>
                            <Col md="2"></Col>
                            <Col md="8">
                                <PostItem props={post} />
                            </Col>
                            <Col md="2"></Col>
                        </Row>
                    </div>

                </div>
            );
        })


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

    render() {
        const position = [51.505, -0.09]
        console.log('this.state.username', this.state.country)
        const {country, region} = this.state;
        if (this.state.isLoading) {
            return null;
        }


        return (

            <div className="profile">

                <Modal isOpen={
                        this.state.closeModal
                    }
                    toggle={
                        this.state.closeModal
                }>
                    <ModalHeader toggle={
                        this.closeModal
                    }>Change Profile Picture
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
                <div>
                    <Row>
                        <Col md="3"></Col>
                        <Col md="6" className="profile-container">
                            <div>
                                <img src={
                                        this.state.avatarUrl === null ? profileImg : this.state.avatarUrl
                                    }
                                    className="profile-img"
                                    onClick={
                                        this.handleModal
                                }></img>
                                <p className="text-header1">
                                    {
                                    this.state.username === null ? "Unknown" : "@" + this.state.username
                                }</p>
                            </div>
                            <div>
                                <Tabs id="controlled-tab-example "

                                    activeKey={
                                        this.state.activeTab
                                    }
                                    onSelect={
                                        (k) => this.setState({activeTab: k})
                                }>
                                    <Tab eventKey="1" title="My Posts"
                                        onEnter={
                                            () => {}
                                    }>
                                        {
                                        this.generateMyPostsCards(undefined)
                                    } </Tab>
                                    <Tab eventKey="2" title="Location Settings">
                                        <div>
                                            <div>
                                                <p>Your location is : {
                                                    this.state.country
                                                }, {
                                                    this.state.region
                                                }</p>
                                            </div>
                                            <div>
                                                <CountryDropdown value={country}
                                                    onChange={
                                                        (val) => this.selectCountry(val)
                                                    }/>
                                                <RegionDropdown country={country}
                                                    value={region}
                                                    onChange={
                                                        (val) => this.selectRegion(val)
                                                    }/>
                                            </div>
                                            <div>
                                                <Button color="primary">Update Location</Button>
                                            </div>

                                            <div id="map-container">
                                                <MapContainer center={
                                                        [sessionStorage.getItem('lat')!==null?sessionStorage.getItem('lat'):"", sessionStorage.getItem('long')!==null?sessionStorage.getItem('long'):""]
                                                    }
                                                    zoom={13}
                                                    scrollWheelZoom={false}>
                                                    <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                                    <Marker position={
                                                        [sessionStorage.getItem('lat')!==null?sessionStorage.getItem('lat'):"", sessionStorage.getItem('long')!==null?sessionStorage.getItem('long'):""]
                                                    }></Marker>
                                                </MapContainer>
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="3" title="Achivements">
                                        <p>Helper Tab</p>
                                    </Tab>
                                </Tabs>
                            </div>
                        </Col>
                        <Col md="3"></Col>
                    </Row>
                </div>
            </div>
        )
    }
}


export default Profile;


/**
 *  <Card>

                                    <CardBody>
                                       
                                        <CardTitle tag="h5">
                                            {
                                            post.header
                                        }</CardTitle>
                                        <CardSubtitle tag="h6" className="mb-2 text-muted">@{
                                            post.postedBy
                                        }</CardSubtitle>

                                        <CardText>{
                                            post.body
                                        }</CardText>
                                        <Button>Button</Button>
                                    </CardBody>
                                </Card>
 */

/**
 * REACTSTRAPCODE COMMENTED
 * MAYBE USABLE IN FUTURE
 *  <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '1' })}
            onClick={() => { this.toggle('1'); }}
            style={{cursor:"pointer"}}
          >
            My posts
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggle('2'); }}
            style={{cursor:"pointer"}}
          >
           Second tab
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={this.state.activeTab}>

        <TabPane tabId="1">
          <Row>
            <Col sm="12">
              {this.generateMyPostsCards()}
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
          </Row>
        </TabPane>
          </TabContent>
 */
