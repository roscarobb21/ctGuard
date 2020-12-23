import React, { useState } from 'react';
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
  NavbarText
} from 'reactstrap';

import {Link} from 'react-router-dom'

import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';


/**img import  */
import security from '../../assets/security.png';
import avatarLogo from '../../assets/hipster.png';


import './Navbar.css'



class NavBar extends React.Component {
    constructor(props){
        super(props)
        this.state={
            isOpen:false,
            setIsOpen:false,
            showHits:false,
            searchFocus:false,
            avatarUrl:null,
        }
        if(props.items===undefined || props.items===null){
          this.fetchAvatar();
        }else {
        this.state.avatarUrl= props.items
        }
        console.log('navbar props ', this.state.avatarUrl)
        
    }
    async fetchAvatar(){
      let url= "http://localhost:3001/api";
      let options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          token:localStorage.getItem("token")
        },
      };
      let fetchUserInfo= await fetch(url, options);
      let avatarinfo = await fetchUserInfo.json();
      console.log('ava ', avatarinfo)
      if(fetchUserInfo){
        let newUrl= await avatarinfo.user.avatarUrl;
       this.setState({avatarUrl:newUrl});
      }
    }


 toggle = () => this.setState({isOpen:!this.state.isOpen})


 searchClient = algoliasearch(
  '2540HBTYZ8',
  '12c31ee81965c58c863484b343307e5f'
);

 Hit= (props)=>{
   alert('hit')
   console.log('hit props ', props)
 }

render(){
    if(this.state.searchFocus){
      return(<div className="search-focus">
      </div>)
    }
  return (
    <div>
               
      <Navbar color="light" light expand="md">
          <Nav >
        <NavbarBrand href="/home"><img src={security} className="navbar-logo-brand" alt="logo-security"></img> ctGuard</NavbarBrand>
        </Nav>
        <NavbarToggler onClick={this.toggle} />
        
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="mx-auto" navbar>
           <NavItem className="helper">
           <InstantSearch
    indexName="posts"
    searchClient={this.searchClient}
  >
    <SearchBox onClick={()=>{}} onKeyPress={(evt)=>{
      let input = document.getElementsByClassName("ais-SearchBox-input")[0].value;
      console.log('input is ', input  )
      if(input.length>1){
        this.setState({showHits:true})
      }
    }}
    onFocus={()=>{
      this.setState({searchFocus:false})
    }}
    onBlur={()=>{
      this.setState({searchFocus:false})
    }}
    />
   {this.state.showHits?<Hits/>:null}
  </InstantSearch>

           </NavItem>
           </Nav>
           <Nav className="ml-auto" navbar>
           <NavItem>   
               <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav >
              <img src={this.state.avatarUrl===null?avatarLogo:this.state.avatarUrl} className="navbar-avatar-img"></img>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <Link to="/profile">My Profile</Link>
                </DropdownItem>
                <DropdownItem>
                  Option 2
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={()=>{localStorage.removeItem("token")
                window.location.replace('/login');
                }}>
                    Log out
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
           </NavItem>
           </Nav>
        
        </Collapse>
      </Navbar>
  
    
    </div>
  );}
}

export default NavBar;



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