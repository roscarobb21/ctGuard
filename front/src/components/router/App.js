import React from 'react';
import {BrowserRouter as Router, Route, Switch, withRouter, Redirect} from "react-router-dom";
import {TransitionGroup, CSSTransition} from "react-transition-group";
import {Container, Row, Col, Button} from 'reactstrap'

import Login from '../RegisterAndLogIn/Login'
import Homepage from '../Homepage/Homepage';
import Profile from '../Profile/Profile';
import HomeLogged from '../Pages/HomeLogged';


import LoadingScreen from './LoadingScreen';

import './App.css';


import api from '../../constants/api'

const AnimatedSwitchPublic = withRouter(({location, auth}) => (
    
      
            <Switch location={location}>
                 <Route exact path='/'
                    component={Homepage}/>
              <Route exact path='/login'
                    component={Login}/>
            <Route exact path='/profile' render={()=>{
                return(<Redirect to='/' />)
            }}/>
                    
            </Switch>
        
   
));

const AnimatedSwitchPrivate = withRouter(({location, auth}) => (
   
 
            <Switch location={location}>
            <Route exact path='/'
                    render={()=>{return(<Redirect to='/profile'/>)}}/>
               
                <Route exact path='/profile' component={Profile}/>
                <Route exact path='/home' component={HomeLogged}/>
            </Switch>
    
));


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            haveGoodToken: false
        }
    }

    componentWillMount() {
        setTimeout(function () {
            this.setState({isLoading: false});
        }.bind(this), 1000);
        let url = api + '/api';

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
        console.log('THe response is ', response)
            if(response){
                if(1===response.ok){
                    console.log("User logged in ")
                    this.setState({haveGoodToken:true})
                }
        return
            }
        })
 

    }
/*
     componentDidMount(){
            let token = await localStorage.getItem("token")
        let url = api + '/api';

        let options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            "token": token
          }
        };
    
        let Urlresponse =  fetch(url, options).then(response => response.json())
        .then(response => {
        console.log('THe response is ', response)
            if(response){
                if(1===response.ok){
                    console.log("User logged in ")
                    this.setState({haveGoodToken:true})
                }
        return
            }
        })
 
    }*/

    render() {
        console.log('this havegoodtoken ', this.state.haveGoodToken)
        if (this.state.isLoading) {
            return (
                <div><LoadingScreen/></div>
            )
        }
        return (
            <Router>
            <div className="App">
                <Container fluid>
                    <Row>
                        <Col>
                           {this.state.haveGoodToken?<AnimatedSwitchPrivate/>:<AnimatedSwitchPublic/>}
                        </Col>
                    </Row>
                  <Row>
                  </Row>
                </Container>
            </div>
            </Router>
        );
    }
}

export default App;