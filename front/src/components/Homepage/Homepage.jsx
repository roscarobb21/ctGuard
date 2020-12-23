import React, {Component} from 'react';
import {Toast, ToastBody, ToastHeader, Spinner} from 'reactstrap';
import {
    Row,
    Col,
} from 'reactstrap';
import {Link} from 'react-router-dom';
import './Homepage.css';
import Register from '../RegisterAndLogIn/Register';
import api from '../../constants/api'
/**
 * TODO
 * InfoFirst and InfoSecond dissapear when reaching a scroll point
 */
import FacebookLogin from 'react-facebook-login';
const LogInWithFacebook = ()=>{
return (
<div style={{position:'fixed', top:'0', right:'0%', zIndex:'10000'}}>

<FacebookLogin
    appId="859679134858810"
    autoLoad={false}
    fields="name,email,picture"
    onClick={()=>{console.log('onclick')}}
    callback={responseFacebook} />
</div>

)
}
const responseFacebook = (response) => {
   let token = response.accessToken;
   localStorage.setItem("fbAccess", token);
   if(token !== undefined && token !== null && token !== ""){
    let url=api+'/fb'
    let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({
          email: response.email.toString(),
          name: response.name.toString(),
          id: response.id.toString(),
          accessToken: token
        }),
      };

      let Urlresponse =  fetch(url, options).then(response => response.json())
      .then(response => {
        if(response.token !== undefined && response.token !== null){
            localStorage.setItem("token", response.token)

            window.location.replace('/profile')
        }else {
            alert('There is a problem with the facebook login')
        }
      })
  
   }// if token ok
   else {
       alert('There is a problem logging you in with facebook')
   }

  }
const AlreadyHaveAcc = ()=>{
    return(<div className="fade-in">
        <br></br>
            <p className="text-header2" style={{paddingTop:"2vw"}}>Have an account already? <a href="/login">Log in !</a> </p>
    </div>)
}
const ShowWhoAreWe = () =>{
    return(<div style={{top:0, left:0, position:'fixed', padding:'10px'}}>
       <a href="/help"> <p className="text-header2">Who are we? </p></a>
    </div>)
}

const ShowToolTip = () => {
    return (
        <div className="arrow" onClick={()=>{
            let maxScroll = document.body.scrollHeight - window.innerHeight;
            window.scrollTo({
                top: maxScroll,
                left: 0,
                behavior: 'smooth'
              })
        }}>
            <p className="blink_me">scroll ↓</p>
        </div>
    )
}

const InfoFirst = (items) =>{
    console.log(items.items.xCoord);
        return(<div className={(items.items.pas>=10 && items.items.pas<=17)?"info1-bar-long":"info1-bar-short"} style={{position:'fixed', color:'white', top:0, left: items.items.xCoord, background:'white', borderRadius:'10px', zIndex:'999'}}>
                    <p className="text-header1" style={{zIndex:"1000"}}>OK</p>
        </div>)
}
const InfoSecond = (items) =>{
    console.log('second',items.items.xCoord);
        return(<div className={(items.items.pas>=10 && items.items.pas<=17)?"info2-bar-long":"info2-bar-short"} style={{position:'fixed', color:'white', minWidth:'100px', minHeight:'100px',background:'white', top:window.innerHeight-110,right:0, borderRadius:'10px'}}>
                    <span color="black">geeg gee</span>
        </div>)
}

class Homepage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showScrollTool: true,
            scrollPos: null,
            renderedText: 'hi',
            pas: 1,
            part: document.body.scrollHeight / 10,
            next: null,
            textOpacity: 1,
            infoXCoord:null,
            
        };
        window.scrollTo({top: 0, left: 0, behavior: "smooth"});
    }
    /*
  the maximum scroll value by device will be divided in 10 parts (or 20 parts for more text).
  first parts would be for introduction text. 
  next parts would be for login/signup panel.
  
  */
    componentDidMount() {
        window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        if (typeof window !== "undefined") {
            window.onscroll = () => {
                /**
                 * Get Window Height
                 * Divide window y viewport into 20 pieces
                 */
                let currentScrollPos = window.pageYOffset;
                let maxScroll = document.body.scrollHeight - window.innerHeight;
                let acum = parseInt((currentScrollPos) / (maxScroll / 20))
                /**
                 * Get window width
                 * Divide window X viewport into 20 pieces
                 * piece will be the factor by which div will move
                 */
                let width=window.screen.width;
                let piece= width/20;
                  
                console.log('this is the width : ', piece)
                switch (acum) {
                    case 1:
                        this.setState({renderedText: "hi.", textOpacity: 1, pas: 1, })
                        break;
                    case 2:
                        this.setState({renderedText: "hi..", textOpacity: 1, pas: 2, })
                        break;
                    case 3:
                        this.setState({renderedText: "hi...", textOpacity: 1, pas: 3, })
                        break;
                    case 4:
                        this.setState({
                            renderedText: "hi...and",
                            next: false,
                            textOpacity: 1,
                            showScrollTool: true,
                            pas: 4,
                            infoXCoord:0,

                        })
                        break;
                    case 5:
                        this.setState({renderedText: "hi...and welcome", next: false, textOpacity: 1, pas: 5})
                        break;
                    case 6:
                        this.setState({
                            renderedText: "hi...and welcome to",
                            next: false,
                            textOpacity: 1,
                            pas: 6,
                            showScrollTool: true
                        })
                        break;
                    case 7:
                        this.setState({
                            renderedText: "hi...and welcome to ctGuard",
                            next: false,
                            textOpacity: 1,
                            pas: 7,
                            showScrollTool: false,
                           
                        })
                        break;
                    case 8:
                        this.setState({renderedText: "hi...and welcome to ctGuard", next: false, textOpacity: 1, pas: 8})
                        break;
                    case 9:
                        this.setState({renderedText: "hi...and welcome to ctGuard.", next: false, textOpacity: 1, pas: 9})
                        break;
                    case 10:
                        this.setState({renderedText: "hi...and welcome to ctGuard. Be ", next: true, textOpacity: 1, pas: 10})
                        break;
                    case 11:
                        this.setState({renderedText: "hi...and welcome to ctGuard. Be the next ", next: true, textOpacity: 1, pas: 11 })
                        break;
                    case 12:
                        this.setState({renderedText: "hi...and welcome to ctGuard. Be the next hero.", next: true, textOpacity: 1, pas: 12})
                        break;
                    case 13:
                        this.setState({renderedText: "make society better.", next: true, textOpacity: 1, pas: 13})
                        break;
                    case 14:
                        this.setState({renderedText: "starting from...", next: true, textOpacity: 1, pas: 14})
                        break;
                    case 15:
                        this.setState({renderedText: "starting from...today", next: true, textOpacity: 0.7, pas: 15})
                        break;
                    case 16:
                        this.setState({renderedText: "starting from...today", next: true, textOpacity: 0.3, pas: 16})
                        break;
                    case 17:
                        this.setState({renderedText: "starting from...today", next: true, textOpacity: 0, pas: 17})
                        break;
                    case 18:
                        this.setState({renderedText: "", next: true, textOpacity: 0, pas: 18})
                        break;
                    case 19:
                        this.setState({renderedText: "", next: true, textOpacity: 0, pas: 19})
                        break;
                    case 20:
                        this.setState({renderedText: "", next: true, textOpacity: 0, pas: 20})
                        break;
                }

            }
        }
    }

    componentWillUnmount() {
       // document.location.reload(false)
        window.removeEventListener("scroll", this.handleScroll);
    }

    render() {
        return (
            <div> {
                this.state.showScrollTool ? <ShowToolTip/>: null
            }

                <div className="fixed-div">
                    <div className="home-text">
                        <p className="text-header1"
                            style={
                                {opacity: this.state.textOpacity}
                        }>
                            {
                            this.state.renderedText
                        }</p>
                    </div>
                </div>
                <div>
              {this.state.pas>=7&& this.state.pas <=17?<InfoFirst items={{"xCoord":this.state.infoXCoord, "pas":this.state.pas}} />:null}</div>
              <div>
              {this.state.pas>=7 && this.state.pas <=17?<InfoSecond items={{"xCoord":this.state.infoXCoord, "pas":this.state.pas}} />:null}
              </div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>
                <div className="space"></div>

                <div className="panel">
                    {
                    this.state.pas >= 17 ? (<div><Register/> <AlreadyHaveAcc/></div>): null
                } 
                {this.state.pas>=20? (<div><ShowWhoAreWe/></div>):null}
                {this.state.pas>=20?<LogInWithFacebook/>:null}
                </div>
            </div>
        )
    }

}

export default Homepage
