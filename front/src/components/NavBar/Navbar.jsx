import React, {useState} from 'react';
import {
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
    CustomInput
} from 'reactstrap';
import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText
} from 'reactstrap';
import {Link} from 'react-router-dom'

import algoliasearch from 'algoliasearch';
import {InstantSearch, SearchBox, Hits} from 'react-instantsearch-dom';



/**img import  */
import security from '../../assets/security.png';
import avatarLogo from '../../assets/hipster.png';


/**Routes import from constants */
import api from '../../constants/api'
// import newPostRoute

import ImageUploader from 'react-images-upload';


import './Navbar.css'

const io = require("socket.io-client");

class NavBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            showSearch:true,
            setIsOpen: false,
            showHits: false,
            searchFocus: false,
            avatarUrl: null,
            addPost: false,
            closeModal: false,
            pictures:[]
        }

        if (props.items === undefined || props.items === null ) {
            this.fetchAvatar();
        } else {
            this.state.avatarUrl = props.items
        }
        console.log('navbar props ', this.state.avatarUrl)

    }
    
    socket = io('http://localhost:3001/')


    async componentWillMount() {
        const pos = await navigator.geolocation.getCurrentPosition((position) => {
            if (position !== undefined && position !== null) {
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
                sessionStorage.setItem('lat', position.coords.latitude)
                sessionStorage.setItem('long', position.coords.longitude)
            }
        });
    }
    async fetchNotifications(){
        
    }

    async fetchAvatar() {
        let url = "http://localhost:3001/api";
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
        console.log('ava ', avatarinfo)
        if (fetchUserInfo) {
            let newUrl = await avatarinfo.user.avatarUrl;
            this.setState({avatarUrl: newUrl});
        }
    }


    toggle = () => this.setState({
        isOpen: !this.state.isOpen
    })


    searchClient = algoliasearch('2540HBTYZ8', '12c31ee81965c58c863484b343307e5f');

    Hit = (props) => {
        alert('hit')
        console.log('hit props ', props)
    }
    handleModal = () => {
        this.setState({
            closeModal: !this.state.closeModal
        })
    }
    getFileInput = ()=>{
        let doc = document.getElementById("fileBrowser").files
        let arr= []
       for(let i=0; i<doc.length; i++){
        arr.push(doc[i])
       }
    
        this.setState({pictures: arr});
    }
     submitPost = async () => {
      
        console.log(document.getElementById("postTitle").value)
        console.log(document.getElementById("postBody").value)
        console.log(document.getElementById("selectCategory").value)
        console.log(document.getElementById("file"))

        let url = api + '/api/posts';
        console.log("url is ", url)
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem('token')
            },
            body: JSON.stringify(
                {title:document.getElementById("postTitle").value, body:document.getElementById("postBody").value, category:document.getElementById("selectCategory").value}
            )
        };
        let responseRaw= await fetch(url, options);
       
        let response = await responseRaw.json();
        let mediaUrl = api + '/api/postmedia?postId='+response.postId;
        if(this.state.pictures=== []){
          return;
        }
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
      let mediaFetch =  fetch(mediaUrl, mediaOptions);
      window.location.reload();
       


    }

    handleSearchInput=(evt)=>{
        let searchValue = document.getElementById("search-input-box").value
        /**
         * id = search-input-box
         */
        if(evt.key === "Enter"){
            if(searchValue.length>0 && searchValue !== undefined && searchValue !== null){
                let search = searchValue.split(' ').join('_')
            window.location.assign('/search/'+search)
            }else {
                alert("Search Box Empty")
            }
        }
}
    render() {
        console.log('on drop pictures: ', this.state.pictures)
        if (this.state.searchFocus) {
            return (
                <div className="search-focus"></div>
            )
        }
        return (
            <div style={{zIndex:'999999999'}}>

                <div>
                    <Modal isOpen={
                            this.state.closeModal
                        }
                        toggle={
                            this.state.closeModal
                    }>
                        <ModalHeader toggle={
                            this.closeModal
                        }>Add Post
                        </ModalHeader>
                        <ModalBody>
                            <Form>
                                <FormGroup>
                                    <Label for="exampleText">Post Title</Label>
                                    <Input type="textarea" name="text" id="postTitle"/>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleText">Post Body</Label>
                                    <Input type="textarea" name="text" id="postBody"/>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleSelect">Select category</Label>
                                    <Input type="select" name="select" id="selectCategory">
                                        <option>Request</option>
                                        <option>Incident</option>
                                        <option>Covid-19</option>
                                    </Input>
                                </FormGroup>
                               
      <FormGroup>
        <Label for="exampleCustomFileBrowser">File Browser</Label>
        <CustomInput type="file" id="fileBrowser" name="customFile" multiple={true} onChange={this.getFileInput}/>
      </FormGroup>
                            </Form>

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
                                        this.submitPost()
                                    }
                            }>Ok!</Button>
                        </ModalFooter>
                    </Modal>
                </div>
                <Navbar color="light" light expand="md">
                    <Nav>
                        <NavbarBrand href="/home">
                            <img src={security}
                                className="navbar-logo-brand"
                                alt="logo-security"></img>
                            ctGuard</NavbarBrand>
                    </Nav>
                    <NavbarToggler onClick={
                        this.toggle
                    }/>

                    <Collapse isOpen={
                            this.state.isOpen
                        }
                        navbar>
                        <Nav  navbar >
                            <NavItem style={{textAlign:'center'}}>
                            <FormGroup>
                                <Label></Label>
        <Input
          type="search"
          name="search"
          id="search-input-box"
          placeholder="Press Enter to search"
          onKeyPress={(evt)=>{
            this.handleSearchInput(evt)
        }} style={{visibility:window.location.pathname.split('/')[1]==="search"?'hidden':''}}

        />
      </FormGroup>
                             

                            </NavItem>
                        </Nav>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <UncontrolledDropdown nav inNavbar style={{zIndex:'999999'}}>
                                    <DropdownToggle nav>
                                        <img src={
                                                this.state.avatarUrl === null ? avatarLogo : this.state.avatarUrl
                                            }
                                            className="navbar-avatar-img"></img>
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem>
                                            <Link to="/profile">My Profile</Link>
                                        </DropdownItem>
                                        <DropdownItem onClick={
                                            () => {
                                                this.setState({closeModal: true})
                                            }
                                        }>
                                            Add Post
                                        </DropdownItem>
                                        <DropdownItem onClick={
                                            () => {
                                             window.location.assign('/chat/all')
                                            }
                                        }>
                                            Messages
                                        </DropdownItem>
                                        <DropdownItem divider/>
                                        <DropdownItem onClick={
                                            () => {
                                                localStorage.removeItem("token")
                                                window.location.replace('/login');
                                            }
                                        }>
                                            Log out
                                        </DropdownItem>
                                       
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </NavItem>
                        </Nav>

                    </Collapse>
                </Navbar>


            </div>
        );
    }
}

export default NavBar;

/** Old image uploader
 * replced with improved video+ image uploader
 * 
 *   onDrop(picture) {
      console.log('on drop pictures: ', this.state.pictures)
      this.setState({pictures: picture});
  }
 * <ImageUploader withIcon={true}
                            buttonText='Choose images'
                            onChange={
                                this.onDrop
                            }
                          
                            maxFileSize={5242880}
                            withPreview={true}
                            singleImage={false}/>
 */

/**
 * FILE upload
 *    <FormGroup row>
                                    <Label for="file"
                                        sm={2}>File</Label>
                                    <Col sm={10}>
                                        <Input type="file" name="file" id="file"/>
                                        <FormText color="muted">
                                            Upload images or videos
                                        </FormText>
                                    </Col>
                                </FormGroup>
 */

/**
 * DropDown save
 *  <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Options
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Option 1
                </DropdownItem>
                <DropdownItem>
                  Option 2
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  Reset
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
 */
