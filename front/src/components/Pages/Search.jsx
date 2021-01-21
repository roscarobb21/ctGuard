import React from 'react';
import {Container, Row, Col, CardColumns} from 'reactstrap';

import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText
} from 'reactstrap';
import api from '../../constants/api';
import NavBar from '../NavBar/Navbar';

import {Card, CardBody, CardFooter, CardTitle, CardSubtitle, CardText, Button} from 'reactstrap';
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
            let url = api + '/api/search?seed='+value;
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
        if(values !== undefined && values !== null && values !== [])
        {
            /**
             * FOUND USER TILE
             */
            return values.map((element)=>{
                return (
                    <div className="change-cursor h-30" style={{paddingTop:'10px', paddingRight:'50px', paddingLeft:'50px'}} onClick={()=>{
                        window.location.assign('/user/'+element._id)
                    }}>
                  <Card>
                      <CardTitle>@{element.username}</CardTitle>
                      <CardSubtitle>{element.region}</CardSubtitle>
                      <CardBody><img id="user-search-avatar" src={element.avatarUrl}></img></CardBody>
                  </Card>
                    </div>
                )
            })
        }else {
            return(<p>
                Search returned empty
            </p>)
        }
    }
    generateFoundPosts=(values)=>{
        if(values !== undefined && values !== null && values !== [])
        {
            console.log('this state posts ', this.state.posts)
            return values.map((element)=>{
                return (
                    <div className="change-cursor h-30" style={{paddingTop:'10px',paddingRight:'50px', paddingLeft:'50px'}} onClick={()=>{
                        window.location.assign('/post/'+element._id)
                    }}>
                        <Card body>
          <CardTitle tag="h5">{element.header}</CardTitle>
          <CardText>{element.body}</CardText>
          <CardSubtitle>{element.datePosted}</CardSubtitle>
        </Card>
                    </div>
                )
            })
        }else {
            return(<p>
                Search returned empty
            </p>)
        }


    }
    render() {
        console.log('this.state .posts render ', this.state.posts)
        if (this.state.key === null) {
            return (
                <p>null</p>
            )
        }
        console.log('users ARE ', this.state.users)
        return (
            <div>
                <NavBar/>
                
                <Row style={
                    {marginTop: '3vh'}
                }>
                    <Col md="0" lg="4"></Col>
                    <Col md="12" lg="4">
                        <FormGroup >
                            <Label for="exampleSearch">Search on ctGuard</Label>
                            <Input autoFocus={true} type="search" name="search" id="search-box-page" placeholder="search placeholder"
                                defaultValue={
                                    this.state.key
                                }
                                onKeyDown={evt=>this.handleSearchEvents(evt)}/>
                        </FormGroup>
                    </Col>
                    <Col md="0" lg="4"></Col>
                </Row>
                 <Row>
                     <Col sm="12" md="6" className="text-center">
                    {this.generateFoundPosts(this.state.posts)}
                    </Col>
                    <Col  className="text-center" >
                    {this.generateFoundUsers(this.state.users)}
                    </Col>
                    </Row> 
                   </div>
        );
    }
}

export default Search;
