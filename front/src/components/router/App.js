import React from 'react';
import {BrowserRouter as Router, Route, Switch, withRouter, Redirect} from "react-router-dom";
import {Container, Row, Col} from 'reactstrap'

import Login from '../RegisterAndLogIn/Login'
import Homepage from '../Homepage/Homepage';
import Profile from '../Profile/Profile';
import HomeLogged from '../Pages/HomeLogged';
import ProfileNotFriend from '../Pages/ProfileNotFriend';
import PostPage from '../Pages/PostPage';
import Popular from '../Pages/Popular/Popular';
import ViewPostMedia from '../Pages/ViewPostMedia';
import LoadingScreen from './LoadingScreen';
import Search from '../Pages/Search.jsx';
import Chat from '../Pages/Chat';
import SettingsPage from '../Profile/SettingsPage';
import Forgot from '../RegisterAndLogIn/Forgot';
import ForgotReset from '../RegisterAndLogIn/ForgotReset';
import Footer from '../Footer/Footer';

import AdminRegister from '../Admin/AdminRegister';
import AdminLogin from '../Admin/AdminLogin';
import AdminDashboard from '../Admin/AdminDashboard';
import AdminPost from '../Admin/AdminPost';
import AdminDeAnonReq from '../Admin/AdminDeAnonReq';
import AdminNews from '../Admin/AdminNews';
import { io } from 'socket.io-client';



import api from '../../constants/api';
import "@fontsource/exo-2";
import './App.css';
import './Global.css';

const fontColor={
    color:'white'
}

const AnimatedSwitchPublic = withRouter(({location, auth}) => (
            <Switch location={location}>



                 <Route exact path='/'
                    component={Homepage}/>
              <Route exact path='/login'
                    component={Login}/>
                    <Route exact path='/forgot'
                    component={Forgot}/>
                     <Route exact path='/forgot/:token'
                    component={ForgotReset}/>
              <Route exact path='/admin/register'
                    component={AdminRegister}/>
              <Route exact path='/admin/login'
                    component={AdminLogin}/>
            
            <Redirect exact from='/profile' to="/login"/>
                <Redirect exact from='/home' to="/login"/>
                <Redirect exact from='/user/:id/' to="/login"/>
                <Redirect exact from='/post/:id/' to="/login"/>
                <Redirect exact from='/media' to="/login"/>
                <Redirect exact from='/search/:id/' to="/login"/>
                <Redirect exact from='/chat/:id' to="/login"/>
                <Redirect exact from='/chat/all' to="/login"/>
                <Redirect exact from='/settings' to="/login"/>
                <Redirect exact from='/popular' to="/login"/>  
                <Redirect exact from='/:id' to="/login"/>  
                <Redirect exact from='/:id/:id' to="/login"/>  
                <Redirect exact from='/admin/dashboard' to="/login"/>
                <Redirect exact from='/admin/deAnon'  to="/login"/>
                <Redirect exact from='/admin/post/:id'  to="/login"/>
                <Redirect exact from='/admin/news'  to="/login"/>

               
            </Switch>
        )
);

const AnimatedSwitchPrivate = withRouter(({location, auth}) => (
            <Switch location={location}>
            <Route exact path='/'
                    render={()=>{return(<Redirect to='/profile'/>)}}/>
                   
                <Route exact path='/profile' component={Profile}/>
                <Route exact path='/home' component={HomeLogged}/>
                <Route exact path='/user/:id/' component={ProfileNotFriend}/>
                <Route exact path='/post/:id/' component={PostPage}/>
                <Route exact path='/media' component={ViewPostMedia}/>
                <Route exact path='/search/:id/' component={Search}/>
                <Route exact path='/chat/:id' component={Chat}/>
                <Route exact path='/settings' component={SettingsPage}/>
                <Route exact path='/popular' component={Popular}/>
                <Route exact path='/chat' render={()=>{
                return(<Redirect to='/chat/all' />)  
            }}/>
                <Route exact path='/admin/dashboard' render={()=>{
                    return(<Redirect to='/profile'/>)
                }}/>

            <Redirect exact from='/' to="/profile"/>
            <Redirect exact from='/login' to="/profile"/>
            <Redirect exact from='/forgot'  to="/profile"/>
            <Redirect exact from='/forgot/:token'  to="/profile"/>
            <Redirect exact from='/admin/register'  to="/profile"/>
            <Redirect exact from='/admin/login'  to="/profile"/>
                  
            </Switch>
    )
);

const AnimatedSwitchAdmin = withRouter(({location, auth}) => (
    <Switch location={location}>
          <Redirect exact from='/' to="/profile"/>
            <Redirect exact from='/login' to="/profile"/>
            <Redirect exact from='/forgot'  to="/profile"/>
            <Redirect exact from='/forgot/:token'  to="/profile"/>
            <Redirect exact from='/admin/register'  to="/profile"/>
            <Redirect exact from='/admin/login'  to="/profile"/>
    <Route exact path='/'
            render={()=>{return(<Redirect to='/profile'/>)}}/>
        <Route exact path='/profile' component={Profile}/>
        <Route exact path='/home' component={HomeLogged}/>
        <Route exact path='/user/:id/' component={ProfileNotFriend}/>
        <Route exact path='/post/:id/' component={PostPage}/>
        <Route exact path='/search/:id/' component={Search}/>
        <Route exact path='/chat/:id' component={Chat}/>
        <Route exact path='/settings' component={SettingsPage}/>
        <Route exact path='/media' component={ViewPostMedia}/>
        <Route exact path='/popular' component={Popular}/>
        <Route exact path='/admin/dashboard' component={AdminDashboard}/>
        <Route exact path='/admin/deAnon' component={AdminDeAnonReq}/>
        <Route exact path='/admin/post/:id' component={AdminPost}/>
        <Route exact path='/admin/news' component={AdminNews}/>
        <Route exact path='/chat' render={()=>{
        return(<Redirect to='/chat/all' />)
    }}/>  
    </Switch>
    )
);


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            haveGoodToken: false,
            isAdmin:false,
            dark:null,
            theme:null,
        }
      
        
    }

    /*
   async UNSAFE_componentWillMount() {
        setTimeout(function () {
            this.setState({isLoading: false});
        }.bind(this), 1000);

     
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
    
        let Urlresponse =  fetch(url, options).then(response => response.json())
        .then(response => {
            if(response){
                if(1===response.ok ){
                    console.log("User logged in ", response)
                    this.setState({haveGoodToken:true, isAdmin:response.user.isAdmin})
                }
        return
            }
        })
    }
    */
  async UNSAFE_componentWillMount(){
    let dark = await localStorage.getItem('dark')
    if(dark === null || dark === undefined){
        await localStorage.setItem('dark', 'false')
    }else {
        if (localStorage.getItem('dark')==="true") {
            document.body.classList.add('dark-mode');
          }else {
            document.body.classList.add('white-mode');
          }
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
    console.log("🚀 ~ file: App.js ~ line 219 ~ App ~ UNSAFE_componentWillMount ~ response", response)
    let dark = await localStorage.getItem('dark')
    if(response.ok === 1){
        this.setState({haveGoodToken:true, isLoading:false, isAdmin:response.user.isAdmin})
    }else {
        this.setState({haveGoodToken:false,isLoading:false, isLoading:false})
    }
    }
    catch(err){
        
    let dark = await localStorage.getItem('dark')
    if(dark === null || dark === undefined){
       await localStorage.setItem('dark', 'false')
    }
    let theme = await dark === "true"?'dark-theme-background':'white-theme-background'
    this.setState({haveGoodToken:false, isLoading:false, theme:theme})
    }

   }


  

     async componentDidMount(){
     
    }

    render() {
        console.log('App.js 1. Good Token : ', this.state.haveGoodToken)
        console.log('App.js 2. isAdmin : ', this.state.isAdmin)
        if (this.state.isLoading) {
            return (
                <div><LoadingScreen/></div>
            )
        }
        return (
            <Router>
            <div className={'App white-theme-background'}>
                <div className={fontColor}>
                <Container className="background" fluid style={{minHeight:'inherit'}}>
                    <Row style={{minHeight:'inherit'}}>
                        <Col style={{minHeight:'inherit'}}>
                        <div style={{minHeight:'100%'}}>
                           {(this.state.isAdmin && this.state.haveGoodToken)?<AnimatedSwitchAdmin/>:this.state.haveGoodToken?<AnimatedSwitchPrivate/>:<AnimatedSwitchPublic/>}
                           </div>
                        </Col>
                    </Row>
                  
                </Container>
                </div>
            </div>
            </Router>
        );
    }
}

export default App;
