import React from 'react';
import {Container, Row, Col, CardColumns} from 'reactstrap';

import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    Spinner,
    Badge
} from 'reactstrap';
import {Tab, Tabs, Nav } from 'react-bootstrap'
import moment from 'moment';
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';
import ctGuardLogo from '../../assets/security.png';
import {Card, CardBody, CardFooter, CardTitle, CardSubtitle, CardText, Button} from 'reactstrap';


import PostIcon from '../../assets/manage.png';
import UserIcon from '../../assets/user.png';


import locationImg from '../../assets/locationImg.png';

import './General.css'

class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            key: null,
            searchProp:null,
            users:null,
            posts:null,
            count:0,
        }
    }
    componentWillMount() {
        let path = window.location.pathname;
        let id = path.split('/')[2]
        if (id !== undefined && id !== null) {
            let newId = id.split('_').join(' ')
            this.setState({key: newId, searchProp:newId})
        }
        this.fetchSearch();
    }
    componentDidMount(){
        this.fetchSearch(this.state.key);
        console.log('component did mount ', this.state.searchGot)
    }
    handleSearchEvents=(evt)=>{
        let value = document.getElementById("search-box-page").value
        console.log(evt)
        console.log('search got is ', value)
        let searchValue = value;
        if(value.length<=2){
            return
        }
        if(evt.keyCode!==8 && evt.key !== "Enter"){
            this.fetchSearch(value+evt.key.toString())
            return
        }
        if(evt.key==="Enter"){
            this.fetchSearch(value)
            return
        }
        if(evt.keyCode===8){
            this.fetchSearch(document.getElementById("search-box-page").value.toString().slice(0, -1))
            return
        }
        this.fetchSearch(value);
        return;
        
    }
    fetchSearch = (value) => { /**
             * Fetch user search
             */
            console.log('fetch de ', value)
            let url = api.backaddr + '/api/search?seed='+value;
            let options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    token: localStorage.getItem("token").toString()
                }
            };
            fetch(url, options).then(response=>response.json()).then((response)=>{
                console.log('THis is the response : ', response.user)
                this.setState({users:response.user, posts:response.post})
            })
    }
    generateFoundUsers=(values)=>{
        if(values !== undefined && values !== null && values !== [] && values.length !==0)
        {
            /**
             * FOUND USER TILE
             */
            return values.map((element)=>{
                return (
                    <div className="change-cursor h-30"
                    style={{paddingTop:'10px', paddingRight:'50px', paddingLeft:'50px'}} onClick={()=>{
                        window.location.assign('/user/'+element._id)
                    }}>
                  <Card className="card-footer-accent" style={{minHeight:'100px', padding:'10px'}}>
                  <CardBody><img id="user-search-avatar" className="float-left" style={{borderRadius:'50%'}} src={api.cdn+ api.avatarMedia.p128+element.avatarUrl}></img>
                  &nbsp;<span className="float-left">@{element.username}</span>
                  &nbsp;
                  </CardBody>
                      <CardSubtitle className=""><span className="float-right"><img src={locationImg} style={{wdith:'24px', height:'24px'}}></img><span>{element.country},&nbsp;{element.region}</span></span></CardSubtitle>
                  </Card>
                    </div>
                )
            })
        }else {
            return(<p>
                No users found
            </p>)
        }
    }
    generateFoundPosts=(values)=>{
        if(values !== undefined && values !== null && values !== [] && values.length !== 0)
        {
            console.log('this state posts ', this.state.posts)
            return values.map((element)=>{
                return (
                    <div className="change-cursor h-30" style={{paddingTop:'10px',paddingRight:'50px', paddingLeft:'50px'}} onClick={()=>{
                        window.location.assign('/post/'+element._id)
                    }}>
                        <Card body className="card-footer-accent" style={{padding:'10px'}}>
          <CardTitle tag="h5"><span>{element.header.length>50?element.header.substring(0, 50):element.header}</span></CardTitle>
          <CardText><span>{element.body.length>50?element.body.substring(0, 50)+'...':element.body}</span></CardText>
          <CardSubtitle><span>{moment(element.datePosted).format("MMMM Do YYYY, h:mm:ss a")}</span></CardSubtitle>
        </Card>
                    </div>
                )
            })
        }else {
            return(<p>
                No posts found
            </p>)
        }


    }
    render() {
        if (this.state.key === null) {
            return (
                <Spinner/>
            )
        }
       // console.log('users ARE ', this.state.users)
        return (
            <div className="background" style={{minHeight:'100vh'}}>
                <NavBar/>
                <Container>
                <div className="background-component" style={{ borderRadius:'20px', marginTop:'30px',minHeight:'80vh', padding:'20px'}}>
                <Row style={
                    {marginTop: '3vh'}
                }>
                    <Col md="0" lg="4"></Col>
                    <Col md="12" lg="4">
                        <FormGroup >
                            <Label for="exampleSearch"><span className="text-header2">Search on ctGuard <img src={ctGuardLogo} style={{width:'36px', height:'36px'}}></img></span></Label>
                            <Input autoFocus={true} type="search" name="search" id="search-box-page" placeholder="Enter your search here"
                                defaultValue={
                                    this.state.key
                                }
                                onKeyDown={evt=>this.handleSearchEvents(evt)}/>
                        </FormGroup>
                    </Col>
                    <Col md="0" lg="4"></Col>
                </Row>
                <Row>
                    <Col>
                    <div style={{marginTop:'30px', minHeight:'500px', border:'solid',borderColor:'black', borderWidth:'1px', borderRadius:'20px', padding:'20px'}} className="">
                    <Tab.Container id="left-tabs-example" defaultActiveKey="posts">
                            <Row style={{minHeight:'inherit', maxHeight:'100%'}}>
                                <Col sm={3} style={{height:'inherit'}} align="center" >
                                <Nav variant="pills" className="flex-column align-self-center" >
                                    <Nav.Item className="settings-sidebar-left">
                                    <Nav.Link className="settings-nav" eventKey="posts"><img className="search-icons" src={PostIcon}></img>&nbsp;<span>Posts</span>&nbsp;<Badge color={this.state.posts!== null?this.state.posts.length>0?'primary':'secondary':'secondary'}>{this.state.posts === null? 0:this.state.posts.length}</Badge></Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className="settings-sidebar-left">
                                    <Nav.Link className="settings-nav" eventKey="users"><img className="search-icons" src={UserIcon}></img>&nbsp;<span>Users</span>&nbsp;<Badge color={this.state.users!== null?this.state.users.length>0?'primary':'secondary':'secondary'}>{this.state.users === null? 0:this.state.users.length}</Badge></Nav.Link>
                                    </Nav.Item>
                                </Nav>
                                </Col>
                                <Col sm={9} style={{minHeight:'inherit',maxHeight:'100%', height:'100%', overflowY:'scroll'}}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="posts">
                                        <div style={{height:'inherit', maxHeight:'100%', overflowY:'scroll'}}>
                                    {this.generateFoundPosts(this.state.posts)}
                                        </div>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="users">
                                    {this.generateFoundUsers(this.state.users)}
                                    </Tab.Pane>
                                </Tab.Content>
                                </Col>
                            </Row>
                            </Tab.Container>
                            </div>
                    </Col>
                </Row>
                   </div>
                   
                   </Container>
                   </div>
        );
    }
}

export default Search;



/*

<Row>
<Col sm="12" md="12" className="text-center">
    <p>Posts : </p>
{this.generateFoundPosts(this.state.posts)}
</Col>
<Col  className="text-center" >
   <p>Users: </p>
{this.generateFoundUsers(this.state.users)}
</Col>
</Row> 

*/