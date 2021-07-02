import React, {useState} from 'react';
import {
    Badge,
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Col,
    CustomInput,
    Fade
} from 'reactstrap';
import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    InputGroup,
    InputGroupText,
    InputGroupAddon
} from 'reactstrap';
import { Alert , Progress} from 'reactstrap';
import {Link} from 'react-router-dom';
import {Spinner} from 'reactstrap';

import latinize from 'latinize';
import {CountryDropdown, RegionDropdown, CountryRegionData} from 'react-country-region-selector';
import Geocode from "react-geocode";
/**img import  */
import security from '../../assets/security.png';
import avatarLogo from '../../assets/hipster.png';

import Skeleton from 'react-loading-skeleton';
import searchImg from '../../assets/search.png';
/**Routes import from constants */
import api from '../../constants/api'
// import newPostRoute
import {geolocated} from "react-geolocated";

import Notification from '../../assets/notification.wav';

import ProfileIcon from '../../assets/user.png';
import Settings from '../../assets/settings.png';
import AddPostIcon from '../../assets/plus.png';
import ChatIcon from '../../assets/chat.png';
import ManageIcon from '../../assets/manage.png';
import NewsIcon from '../../assets/news.png';
import AnonIcon from '../../assets/anon.png';
import LogoutIcon from '../../assets/logout.png';

import './Navbar.css'
import Profile from '../Profile/Profile';

const io = require("socket.io-client");

class NavBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lat: null,
            long: null,
            country: null,
            region: null,
            uid: null,
            isAdmin: false,
            isOpen: false,
            showSearch: true,
            setIsOpen: false,
            showHits: false,
            searchFocus: false,
            avatarUrl: null,
            addPost: false,
            closeModal: false,
            joinedPush: false,
            pushMsg: 0,
            pictures: [],
            searchFocused: false,
            addPostSpin: false,
            locateSpin: false,
            triggerAvatarBadge:false,
            msgAlert:false,
            alertMsgString:"",
            notificationAvatar:"",
            addPostErr:false,
            addPostErrTxt:"",
            postTitle:"",
            postBody:"",
            postCategory:"Request",
            postCountry:"",
            postRegion:"",
            searchString:"",
            progressNumber:0,
            progressStart:false,
            pushNews:false,
            pushNewsText:"",
            active:false,
            sendFirstOnline:false,
            interval: 1000,
        }

        if (props.items === undefined || props.items === null) {
            this.fetchAvatar();
        } else {
            this.state.avatarUrl = props.items
        }

    }

    socket = io(api.backaddr)


    async componentWillMount() {
        const pos = await navigator.geolocation.getCurrentPosition((position) => {
            if (position !== undefined && position !== null) {
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
                sessionStorage.setItem('lat', position.coords.latitude)
                sessionStorage.setItem('long', position.coords.longitude)
            }
        });
        let url = api.backaddr + api.authUser+ api.routes.navbarMsgNumber;
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
        this.setState({pushMsg:response.number})
    }



    timerId = setInterval(() => {
        let url = api.backaddr + '/api/online';
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem('token')
            }
        };
        console.log("Sent online! ")
        fetch(url, options)
      }, 60000);
      componentWillUnmount(){
        clearTimeout(this.timerId);
    }


    MINUTE_MS = 10000;
    componentDidMount() {
     
        this.setState({interval:30000})

        this.socket.on('push_news', (news) => {
            console.log("🚀 ~ file: Navbar.jsx ~ line 147 ~ NavBar ~ this.socket.on ~ news", news)
            let audio = new Audio(Notification);
            audio.play()
            this.setState({pushNews:true, pushNewsText:news[0].newsText})
        })

      
/**
 * Update message number 
 * play message sound
 */
        this.socket.on('push_notification', ({ruid, from, avatarUrl}) => {
            let audio = new Audio(Notification);
            audio.play()
            this.setState({
                pushMsg: this.state.pushMsg + 1,
                triggerAvatarBadge:true,
                alertMsgString:from,
                msgAlert:true,
                notificationAvatar:avatarUrl
            })
        })
        /*
        this.socket.on('finish_upload', ()=>{
            this.setState({progressStart:true, progressNumber:100})
           setTimeout(function(){
            window.location.reload()
           },1500)
        })
        this.socket.on('no_post_media', ()=>{
            if(this.state.pictures.length === 0  || this.state.pictures === [] || this.state.pictures === null){
                window.location.reload();
            }else {
                    this.setState({addPostErrTxt:"Media upload failed", addPostErr:true})
        }
        })
        */

    }
    async fetchNotifications() {}

    async fetchAvatar() {
        let url = api.backaddr + "/api";
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token")
            }
        };
        let fetchUserInfo = await fetch(url, options);
        let avatarinfo = await fetchUserInfo.json();
        if (fetchUserInfo) {
            console.log("🚀 ~ file: Navbar.jsx ~ line 203 ~ NavBar ~ fetchAvatar ~ fetchUserInfo", avatarinfo)
            let newUrl = await avatarinfo.user.avatarUrl;
            let newsView, newsText;
            if(avatarinfo.user.newsview === ""){
                newsView = false;
            }else {
                newsView = !avatarinfo.user.newsview?.news_viewed;
            }
            if(avatarinfo.user.newstext === ""){
                newsText = "";
            }else {
                newsText =  avatarinfo.user.newstext.newsText
            }

            this.setState({
                avatarUrl: newUrl,
                uid: avatarinfo.user.id.toString(),
                isAdmin: avatarinfo.user.isAdmin,
                country: avatarinfo.user.country,
                region: avatarinfo.user.region,
                pushNews: newsView,
                pushNewsText: newsText
            });
        }
    }


    toggle = () => this.setState({
        isOpen: !this.state.isOpen
    })


    handleModal = () => {
        this.setState({
            closeModal: !this.state.closeModal
        })
    }
    getFileInput = () => {
        let doc = document.getElementById("fileBrowser").files
        let arr = []
        for (let i = 0; i < doc.length; i++) {
            arr.push(doc[i])
        }

        this.setState({pictures: arr});
    }
    submitPost = async () => {
        if(this.state.postTitle.length === 0 ){
            this.setState({addPostErr:true, addPostErrTxt:"Please enter post title"});
            return
        }
        if(this.state.postBody.length === 0 ){
            this.setState({addPostErr:true, addPostErrTxt:"Please enter post body"});
            return
        }
        if(this.state.country.length === 0){
            this.setState({addPostErr:true, addPostErrTxt:"Please select your country"});
            return
        }
        if(this.state.region.length === 0){
            this.setState({addPostErr:true, addPostErrTxt:"Please select the region"});
            return
        }
        let url = api.backaddr + '/api/posts';
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem('token')
            },
            body: JSON.stringify(
                {title: this.state.postTitle, body: this.state.postBody, category: this.state.postCategory,
                country:this.state.country, region:this.state.region, lat:this.state.lat, long:this.state.long
            }
            )
        };
        let responseRaw = await fetch(url, options);

        let response = await responseRaw.json();
        let mediaUrl = api.backaddr + '/api/postmedia?postId=' + response.postId;
        if (this.state.pictures === []) {
            return;
        }
        this.setState({progressStart:true})
        const data = new FormData();
        this.state.pictures.forEach(picture => {
            data.append('image', picture)
        });
        let mediaOptions = {
            method: "POST",
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            },
            body: data
        };
        this.setState({addPostSpin: true})
        fetch(mediaUrl, mediaOptions).then(response => response.json()).then(response => {
            
            if (response.ok === 1) {
               window.location.reload()
            }
            if(response.ok === 0){
                window.location.reload()
               // this.setState({addPostErrTxt:"There is a problem uploading your media", addPostErr:true})
            }
        })

    }

    handleSearchInput = (evt) => {
        let searchValue = this.state.searchString;
        /**
         * id = search-input-box
         */
        if (evt.key === "Enter") {
            if (searchValue.length > 0 && searchValue !== undefined && searchValue !== null) {
                let search = searchValue.split(' ').join('_')
                window.location.assign('/search/' + search)
            } else {
                alert("Search Box Empty")
            }
        }
    }
    autoLocateButton = async () => { // get user coords then fetch to backend to get country and region
        this.setState({locateSpin: true})
        await navigator.geolocation.getCurrentPosition((position) => {
            this.setState({lat: position.coords.latitude, long: position.coords.longitude})
            let url = api.backaddr + '/api/location?lat=' + position.coords.latitude.toString() + '&lon=' + position.coords.longitude;
            let options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                }
            };
            fetch(url, options).then(response => response.json()).then(async (response) => {
                let newCountry = await latinize(response.address.country)
                let newCounty = await latinize(response.address.county)
                this.setState({locateSpin: false, country: newCountry, region: newCounty})
            })

        });
    }
    selectCountry = (val) => {
        this.setState({country: val})
    }
    selectRegion = (val) => {
        this.setState({region: val})
    }


    dismissNews = ()=>{
        let url = api.backaddr + api.authUser + '/dismiss_news'
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        }
        fetch(url, options)
        this.setState({pushNews:false})
    }
    render() {
        if (this.state.uid !== null && !this.state.joinedPush) {
            this.socket.emit('join_push_notifications', this.state.uid)
            this.setState({joinedPush: true})
        }
        if (this.state.searchFocus) {
            return (
                <div className="search-focus"></div>
            )
        }
        return (
            <div style={
                {zIndex: '999999999'}
            }>

                <div>
                    <Modal isOpen={
                            this.state.closeModal
                        }
                        toggle={
                            this.state.closeModal
                    }>
                        <ModalHeader toggle={
                            this.closeModal
                        }><span>Add Post</span>
                        </ModalHeader>
                        <ModalBody>
                          {this.state.addPostErr &&  <div style={{border:'solid', borderColor:'#ff2e63', borderWidth:'1px', padding:'10px'}}>
                                <span style={{color:"#ff2e63"}}>{this.state.addPostErrTxt}</span>
                            </div>}
                            <Form>
                                <FormGroup>
                                    <Label for="exampleText"><span>Post Title</span></Label>
                                    <Input type="textarea" name="text" id="postTitle"
                                    spellCheck="false"
                                    onChange = {evt=>{this.setState({postTitle:evt.target.value})}}
                                    />
                                    <FormText color="muted" className="text-justify">
                                        <span>Post title should contain a short introduction into the matter</span>
                                    </FormText>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleText"><span>Post Body</span></Label>
                                    <Input type="textarea" name="text" id="postBody"
                                     spellCheck="false"
                                     onChange = {evt=>{this.setState({postBody:evt.target.value})}}
                                    />
                                    <FormText color="muted" className="text-justify">
                                        <span>In the body section you should provide a complete view of the matter</span>
                                    </FormText>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleSelect"><span>Select category</span></Label>
                                    <Input type="select" name="select" id="selectCategory"
                                     spellCheck="false"
                                     value={this.state.postCategory}
                                     onChange = {evt=>{this.setState({postCategory:evt.target.value})}}
                                    >
                                        <option value="Request">Request</option>
                                        <option value="Incident">Incident</option>
                                        <option value="Covid-19">Covid-19</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleText"><span>Location</span></Label>
                                    <div>
                                        <CountryDropdown className="country-drop"
                                        whitelist="RO"
                                            value={
                                                this.state.country
                                            }
                                            onChange={
                                                (val) => this.selectCountry(val)
                                            }/>
                                        <RegionDropdown className="region-drop"
                                        style={{marginTop:'10px'}}
                                            country={
                                                this.state.country
                                            }
                                            value={
                                                this.state.region
                                            }
                                            onChange={
                                                (val) => this.selectRegion(val)
                                            }/>
                                    </div>
                                    <FormText color="muted" className="text-justify">
                                        <span>Post location will be defaulted to your profile location. You can change it manually, or choose to auto locate you. You need to allow access to your location in your browser.</span>
                                    </FormText>

                                    {
                                    !this.state.locateSpin ? <Button className="text-center" color="primary"
                                        onClick={
                                            this.autoLocateButton
                                    }>Auto locate me!</Button> : <Spinner/>
                                } </FormGroup>


                                <FormGroup>
                                    <Label for="exampleCustomFileBrowser"><span>Attach photos or video</span></Label>
                                    <CustomInput type="file" id="fileBrowser" name="customFile"
                                        accept="image/* video/*"
                                        multiple={true}
                                        onChange={
                                            this.getFileInput
                                        }/>
                                        <small className="text-color">Media files with .jpg .jpeg .png .mp4 extension</small>
                                </FormGroup>
                                {this.state.progressStart && <Progress animated  value={this.state.progressNumber}/>}
                            </Form>

                        </ModalBody>

                        <ModalFooter> {
                            this.state.addPostSpin ? <Spinner/>: (
                                <div>
                                    <Button color="danger"
                                        onClick={
                                            () => {
                                                this.setState({closeModal: false})
                                            }
                                    }>Cancel</Button>
                                    &nbsp;&nbsp;&nbsp;
                                    <Button color="primary"
                                        onClick={
                                            () => {
                                                this.submitPost()
                                            }
                                    }>Post!</Button>
                                </div>
                            )
                        } </ModalFooter>
                    </Modal>
                </div>


                <Navbar className="footer-header" light expand="md">
                    <Nav>
                        <NavbarBrand href="/home" className="change-cursor">
                            <img src={security}
                                className="navbar-logo-brand"
                                alt="logo-security"></img>
                            <span className="ctGuard-text ">ctGuard</span>
                        </NavbarBrand>
                    </Nav>
                    <NavbarToggler onClick={
                        this.toggle
                    }/>

                    <Collapse isOpen={
                            this.state.isOpen
                        }
                        style={{outline:'none'}}
                        navbar>
                        <Nav navbar className="justify-content-center">
                            <NavItem style={
                                {
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    alignContent: 'center'
                                }
                            }>

                                <Col className="">
                                    <div className="search-group">
                                    <InputGroup >
                                             <InputGroupAddon addonType="prepend" style={{ visibility: window.location.pathname.split('/')[1] === "search" ? 'hidden' : ''}}>
                                    <InputGroupText >
                                    <img src={searchImg} style={{width:'16px', height:'16px'}}></img>
                                    </InputGroupText>
                                    </InputGroupAddon>

                                        <Input 
                                        spellCheck="false"
                                        className="search-focus" type="search" name="search" id="search-input-box" placeholder="Press Enter to search"
                                        onChange={evt=>{this.setState({searchString:evt.target.value})}}
                                            onKeyPress={
                                                (evt) => {
                                                    this.handleSearchInput(evt)
                                                }
                                            }
                                            style={
                                                {
                                                    visibility: window.location.pathname.split('/')[1] === "search" ? 'hidden' : '',
                                                    width: '50%',
                                                    marginleft: '',
                                                    
                                                }
                                            }/>
                                     
                                    
                                    </InputGroup>
                                    </div>
                            </Col>

                        </NavItem>
                    </Nav>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <UncontrolledDropdown className="slide-up-enter" nav inNavbar
                                style={
                                    {zIndex: '1'}
                            }>

                                <DropdownToggle nav >
                                    {this.state.avatarUrl === null && <Skeleton className="skeleton-theme" circle={true} height={50} width={50} />}
                                {this.state.avatarUrl !== null && 
                                    <img src={
                                            this.state.avatarUrl === null ? avatarLogo : api.cdn + api.avatarMedia.p128 + this.state.avatarUrl
                                        }
                                        className="navbar-avatar-img"></img>}

                                        {this.state.triggerAvatarBadge && <Badge color="primary">{this.state.pushMsg}</Badge>}
                                </DropdownToggle>
                                <DropdownMenu right className="navbar-dropdown-wrapper" style={{width:'300px'}}>
                                    <DropdownItem header className="accent-color">Profile</DropdownItem>
                                    <DropdownItem
                                    className="hide-outline"
                                    onClick={
                                        () => {
                                            window.location.assign('/profile')
                                        }
                                    }>
                                        <img className="nav-dropdown-icons" src={ProfileIcon}></img>&nbsp;My Profile
                                    </DropdownItem>
                                    <DropdownItem onClick={
                                        () => {
                                            window.location.assign('/settings')
                                        }
                                    }>
                                        <img className="nav-dropdown-icons" src={Settings}></img>&nbsp;Profile Settings
                                    </DropdownItem>
                                    {this.state.isAdmin && 
                                    <div>
                                    <DropdownItem divider/>
                                    <DropdownItem header className="accent-color">Administration</DropdownItem>
                                    </div>
                                    }
                                    {
                                    this.state.isAdmin && <DropdownItem style={
                                            {color: '#ff2e63'}
                                        }
                                        onClick={
                                            () => {
                                                window.location.assign('/admin/dashboard')
                                            }
                                    }>
                                        <img className="nav-dropdown-icons" src={ManageIcon}></img>&nbsp;Manage Posts
                                    </DropdownItem>
                                }
                                    {
                                    this.state.isAdmin && <DropdownItem style={
                                            {color: '#ff2e63'}
                                        }
                                        onClick={
                                            () => {
                                                window.location.assign('/admin/deAnon')
                                            }
                                    }>
                                        <img className="nav-dropdown-icons" src={AnonIcon}></img>&nbsp;deAnon Request Pool
                                    </DropdownItem>
                                }
                                 {
                                    this.state.isAdmin && <DropdownItem style={
                                            {color: '#ff2e63'}
                                        }
                                        onClick={
                                            () => {
                                                window.location.assign('/admin/news')
                                            }
                                    }>
                                         <img className="nav-dropdown-icons" src={NewsIcon}></img>&nbsp;Push News
                                    </DropdownItem>
                                }
                                    <DropdownItem divider/>
                                    <DropdownItem header className="accent-color">Social</DropdownItem>
                                     
                                    <DropdownItem onClick={
                                        () => {
                                            this.setState({closeModal: true})
                                        }
                                    }>
                                        <img className="nav-dropdown-icons" src={AddPostIcon}></img>&nbsp;Add Post
                                    </DropdownItem>
                                    <DropdownItem onClick={
                                        () => {
                                            window.location.assign('/chat/all')
                                        }
                                    }>
                                        <img className="nav-dropdown-icons" src={ChatIcon}></img>&nbsp;Messages
                                        &nbsp;
                                        {this.state.pushMsg>0 &&
                                        <Badge color="primary">
                                            {
                                            this.state.pushMsg
                                        }</Badge>
                                    }
                                    </DropdownItem>
                                    <DropdownItem divider/>
                                    <DropdownItem onClick={
                                        () => {
                                            localStorage.removeItem("token")
                                            window.location.replace('/login');
                                        }
                                    }>
                                       <img className="nav-dropdown-icons" src={LogoutIcon}></img>&nbsp; Log out
                                    </DropdownItem>

                                </DropdownMenu>

                            </UncontrolledDropdown>
                           
                        </NavItem>
                    </Nav>

                </Collapse>
            </Navbar>
            {this.state.pushNews && <Alert color="danger" style={{textAlign:'left'}}>
                {this.state.pushNewsText} <span className="float-right change-cursor" title="If you click on X you will forever dismiss this message" onClick={this.dismissNews}>x</span></Alert>}
            <Alert style={{position:'fixed', bottom:'10px', right:'30px', zIndex:'99999'}} color="info" isOpen={this.state.msgAlert} toggle={()=>{this.setState({msgAlert:!this.state.msgAlert})}} >
            <img style={{borderRadius:'50%'}} className="nav-dropdown-icons" src={this.state.notificationAvatar.length===0?ChatIcon:api.cdn+api.avatarMedia.p128+this.state.notificationAvatar}></img>&nbsp;New message from @{this.state.alertMsgString}
    </Alert>

        </div>
        );
    }
}

export default NavBar;


