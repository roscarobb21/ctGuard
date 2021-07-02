import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Container, Row, Col, Spinner} from 'reactstrap';
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    Button,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import NavBar from '../NavBar/Navbar';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';


import ctLogo from '../../assets/security.png'
import api from '../../constants/api';

import './Admin.css'


class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingData:false,
            categoryFilterDrop: "Category",
            stateFilterDrop: "Status",
            posts:null,
            pages:null,
            numberOfPages:null,
            tableLoading:true,
            postsDrop:"Posts per page",
            currentPage:1,
            numberOfEntries:5,
            dateFilterLower:"",
            dateFilterUpper:"",
            orderByUpvotes:true,
            orderByUpvotesDesc:true,
            ascendingDate:null,
        }

    }
    fetchDataWithFilters= async ()=>{
        this.setState({tableLoading:true})
        let url = api.backaddr+'/admin/post?number='+5+'&page='+this.state.currentPage;
        this.state.categoryFilterDrop!=="Category"?url+="&category="+this.state.categoryFilterDrop:null;
        this.state.stateFilterDrop!=="Status"?url+="&status="+this.state.stateFilterDrop:null;
        this.state.dateFilterLower!==""?url+="&datelower="+this.state.dateFilterLower:null;
        this.state.dateFilterUpper!==""?url+="&dateupper="+this.state.dateFilterUpper:null;
        this.state.orderByUpvotes===true?url+="&orderby=true":url+="&orderby=false"

        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let raw = await fetch(url, options);
        let response = await raw.json();
        
        console.log("DATE from : ", this.state.dateFilterLower)
        
        console.log("DATE to : ", this.state.dateFilterUpper)
        console.log("RESPONSE : , ", response)
        let checkResponse = response.posts.length>0?response.posts:[{header:"No posts available"}]
      
        
        setTimeout(function(){
        
            this.setState({posts:checkResponse, tableLoading:false, pages:response.pages, numberOfEntries: 5, numberOfPages:response.pages.length})
        }.bind(this), 1500)
    }

   async UNSAFE_componentWillMount(){
    let url = api.backaddr+'/admin/post';
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            token: localStorage.getItem("token").toString()
        }
    };
    let raw = await fetch(url, options);
    let response = await raw.json();
    console.log("🚀 ~ file: AdminDashboard.jsx ~ line 93 ~ AdminDashboard ~ UNSAFE_componentWillMount ~ response", response)
    this.setState({posts:response.posts, tableLoading:false, pages:response.pages, numberOfPages:response.pages.length});
    }
     tabOptions = {
        onRowClick: function(row){
            alert(row)
        }
       }
     columns = [ {
      dataField: 'header',
      text: 'Post Title'
    }, {
      dataField: 'body',
      text: 'Post Description'
    }, {
        dataField: 'postedBy',
        text: 'Posted By'
      }, {
        dataField: 'datePostedStr',
        text: 'Date Posted'
      }, 
      {
        dataField:'category',
        text:'Category'
      },
      {
        dataField: 'status',
        text: 'Status'
      }, {
        dataField: 'upVotes',
        text: 'Up votes',
        style:{
            backgroundColor:'rgba(0, 173, 181, 0.5)'
        },
        headerStyle: { backgroundColor: 'rgba(0, 173, 181, 0.5)' }
      }, {
        dataField: 'followers',
        text: 'Followers',
        style:{
            backgroundColor:'transparent'
        },
        headerStyle: { backgroundColor: 'transparent' }
      }];
      
    
    fetchNewPage= async (page, entries, orderby, ascending)=>{
        if(entries === undefined){
            entries=this.state.numberOfEntries;
        }
        this.setState({tableLoading:true, currentPage:page, posts:null})
        let url = api.backaddr+'/admin/post?number='+entries+'&page='+page;
        this.state.categoryFilterDrop!=="Category"?url+="&category="+this.state.categoryFilterDrop:null;
        this.state.stateFilterDrop!=="Status"?url+="&status="+this.state.stateFilterDrop:null;
        this.state.dateFilterLower!==""?url+="&datelower="+this.state.dateFilterLower:null;
        this.state.dateFilterUpper!==""?url+="&dateupper="+this.state.dateFilterUpper:null;
        orderby===null?url+="&orderby=null":orderby===true?url+="&orderby=true":url+="&orderby=false"
        ascending===null?url+="&ascending=null":ascending===true?url+="&ascending=true":url+="&ascending=false"

        console.log("FETCH URL ", url)
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                token: localStorage.getItem("token").toString()
            }
        };
        let raw = await fetch(url, options);
        let response = await raw.json();
        console.log("🚀 ~ file: AdminDashboard.jsx ~ line 151 ~ AdminDashboard ~ fetchNewPage= ~ response", response)
        this.setState({posts:response.posts, tableLoading:false, pages:response.pages, numberOfEntries: entries!== undefined?entries:5, numberOfPages:response.pages.length})
    }

    tableRowEvents = {
        onClick: (e, row, rowIndex) => {
            window.location.assign('/admin/post/'+this.state.posts[rowIndex]._id.toString())
        
        },
        onMouseEnter: (e, row, rowIndex) => {
          //console.log(`enter on row with index: ${rowIndex}`);
        }
     }
     generatePagination=()=>{
         if(this.state.pages.length>0){
             return(this.state.pages.map(element=>{
                 return(
                    <PaginationItem active={this.state.currentPage===element?true:false}>
                    <PaginationLink disabled={this.state.currentPage===element?true:false} onClick={()=>{this.fetchNewPage(element)}}>
                     {element}
                    </PaginationLink>
                    </PaginationItem>
                   
                 ) 
             }))
         }
          }
    render() {
        return (
            <div className="background">
                <NavBar/>
                <div className="text-header2 background" style={{marginTop:'20px', padding:'10px'}}><img  className="icon-medium" src={ctLogo}></img>ctGuard management</div>
              <Container style={{minHeight:'95vh'}} fluid>
                 <div style={{borderRadius:'20px'}}>
                <Row className="background" style={{borderRadius:'20px', paddingBottom:'25px'}} >
                    <Col md="12" lg="3" className="admin-dash-filters-section background-component" style={{padding:''}}>

                        <div style={
                            {height: '500px',
                            borderRadius:'20px',
                        }
                        }>
                            <Row>
                                <Col></Col>
                                <Col>
                                    <span className="text-header2">Filters:
                                    </span>
                                </Col>
                                <Col></Col>
                            </Row>
                            <br></br>
                            <Row>
                                <Col className="float-left">
                                    <UncontrolledDropdown className="">
                                        <DropdownToggle caret>
                                            {
                                            this.state.categoryFilterDrop
                                        } </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({categoryFilterDrop: "Request"})
                                                }
                                            }>Request</DropdownItem>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({categoryFilterDrop: "Incident"})
                                                }
                                            }>Incident</DropdownItem>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({categoryFilterDrop: "Covid-19"})
                                                }
                                            }>Covid-19</DropdownItem>

                                            <DropdownItem divider/>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({categoryFilterDrop: "Category"})
                                                }
                                            }>Delete filter</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Col>
                                <Col>
                                    <UncontrolledDropdown className="">
                                        <DropdownToggle caret>
                                            {
                                            this.state.stateFilterDrop
                                        } </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({stateFilterDrop: "New"})
                                                }
                                            }>New</DropdownItem>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({stateFilterDrop: "Progress"})
                                                }
                                            }>Progress</DropdownItem>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({stateFilterDrop: "Solved"})
                                                }
                                            }>Solved</DropdownItem>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({stateFilterDrop: "Blocked"})
                                                }
                                            }>Blocked</DropdownItem>
                                            <DropdownItem divider/>
                                            <DropdownItem onClick={
                                                () => {
                                                    this.setState({stateFilterDrop: "Status"})
                                                }
                                            }>Delete filter</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Col>
                            </Row>
                            <Row className="m-3">
                                <Col>
                                <FormGroup>
                                        <br></br>
                                        <Label for="datelower" className="float-left"><span>Date range from:</span></Label>
                                        <Input
                                        type="date"
                                        name="datelower"
                                        id="datelower"
                                        placeholder="Select Date"
                                        value={this.state.dateFilterLower}
                                        onChange={(evt)=>{this.setState({dateFilterLower:evt.target.value})}}
                                        isCleareable={true}
                                        />
                                        <br></br>
                                        <Label for="dateupper" className="float-left"><span>Date range to:</span></Label>
                                        <Input
                                        type="date"
                                        name="dateupper"
                                        id="dateupper"
                                        placeholder="Select Date"
                                        value={this.state.dateFilterUpper}
                                        onChange={(evt)=>{this.setState({dateFilterUpper:evt.target.value})}}
                                        />
                                        <br></br>
                                        <Row>
                                            <Col>
                                        <Button className="change-cursor" title="Remove Date filter" onClick={()=>{this.setState({dateFilterLower:""})}}>Clear from</Button>
                                        </Col>
                                        <Col>
                                        <Button className="change-cursor" title="Remove Date filter" onClick={()=>{this.setState({dateFilterUpper:""})}}>Clear to</Button>
                                        </Col>
                                        <Col>
                                        <Button className="change-cursor" title="Remove Date filter" onClick={()=>{this.setState({dateFilterUpper:"", dateFilterLower:""})}}>Clear both</Button>
                                        </Col>
                                        </Row>
                                    </FormGroup>
                                                                </Col>
                            </Row>
                            <Row>
                            <Col>
                               { !this.state.tableLoading && <Button color="primary" onClick={()=>{this.fetchDataWithFilters()}}>Find</Button>
                               }
                             {this.state.tableLoading && <Spinner/>}
                            </Col>
                        </Row>
                        </div>
                        
                    </Col>

                    <Col md="12" lg="9" className="admin-dash-table-section">
                    <Row>
                <UncontrolledDropdown style={{padding:'20px'}}>
      <DropdownToggle caret>
        {this.state.numberOfEntries}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.setState({numberOfEntries:5})
            this.fetchNewPage(1, 5, this.state.orderByUpvotes, this.state.ascendingDate)}} >5</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({numberOfEntries:10})
            this.fetchNewPage(1, 10, this.state.orderByUpvotes, this.state.ascendingDate)}}>10</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({numberOfEntries:15})
            this.fetchNewPage(1, 15, this.state.orderByUpvotes, this.state.ascendingDate)}}>15</DropdownItem>
        <DropdownItem onClick={()=>{
            this.setState({numberOfEntries:20})
            this.fetchNewPage(1, 20, this.state.orderByUpvotes, this.state.ascendingDate)}}>20</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    &nbsp;
    <UncontrolledDropdown style={{padding:'20px'}}>
      <DropdownToggle caret>
        {this.state.orderByUpvotes===null?"No specific order":this.state.orderByUpvotes?"Order by: UpVotes":"Order by: Following"}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
            this.columns[6].style.backgroundColor="rgba(0, 173, 181, 0.5)"
            this.columns[7].style.backgroundColor="transparent"
            this.columns[6].headerStyle.backgroundColor="rgba(0, 173, 181, 0.5)"
            this.columns[7].headerStyle.backgroundColor="transparent"
            this.setState({orderByUpvotes:true, ascendingDate:null})
            this.fetchNewPage(1, this.state.numberOfEntries, true, null)}} >UpVotes</DropdownItem>
        <DropdownItem onClick={()=>{
            this.columns[6].style.backgroundColor="transparent"
             this.columns[7].style.backgroundColor="rgba(0, 173, 181, 0.5)"
             this.columns[6].headerStyle.backgroundColor="transparent"
             this.columns[7].headerStyle.backgroundColor="rgba(0, 173, 181, 0.5)"
            this.setState({orderByUpvotes:false, ascendingDate:null})
            this.fetchNewPage(1, this.state.numberOfEntries, false, null)}}>Following</DropdownItem>
             <DropdownItem onClick={()=>{
            this.columns[6].style.backgroundColor="transparent"
            this.columns[7].style.backgroundColor="transparent"
            this.columns[6].headerStyle.backgroundColor="transparent"
            this.columns[7].headerStyle.backgroundColor="transparent"
            this.setState({orderByUpvotes:null, ascendingDate:null})
            this.fetchNewPage(1, this.state.numberOfEntries, null, null)}}>Don't order</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>

    <UncontrolledDropdown style={{padding:'20px'}}>
      <DropdownToggle caret>
        {this.state.ascendingDate===null?'No specific Date order':this.state.ascendingDate===true?"Ascending Date":"Descending Date"}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{
              this.columns[6].style.backgroundColor="transparent"
              this.columns[7].style.backgroundColor="transparent"
              this.columns[6].headerStyle.backgroundColor="transparent"
              this.columns[7].headerStyle.backgroundColor="transparent"
            this.setState({ascendingDate:true, orderByUpvotes:null})
            this.fetchNewPage(1, this.state.numberOfEntries, this.state.orderByUpvotes, true)}} >Ascending date</DropdownItem>
        <DropdownItem onClick={()=>{
              this.columns[6].style.backgroundColor="transparent"
              this.columns[7].style.backgroundColor="transparent"
              this.columns[6].headerStyle.backgroundColor="transparent"
              this.columns[7].headerStyle.backgroundColor="transparent"
            this.setState({ascendingDate:false, orderByUpvotes:null})
            this.fetchNewPage(1, this.state.numberOfEntries, this.state.orderByUpvotes, false)}}>Descending date</DropdownItem>
        <DropdownItem onClick={()=>{
              this.columns[6].style.backgroundColor="transparent"
              this.columns[7].style.backgroundColor="transparent"
              this.columns[6].headerStyle.backgroundColor="transparent"
              this.columns[7].headerStyle.backgroundColor="transparent"
            this.setState({ascendingDate:null, orderByUpvotes:null})
            this.fetchNewPage(1, this.state.numberOfEntries, this.state.orderByUpvotes, null)}}>No specific date</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
                </Row>
                      {this.state.posts!==null && !this.state.tableLoading &&
                    <BootstrapTable  
                    
                    rowEvents={ this.tableRowEvents }
                    condensed={true} 
                    hover={true} 
                    wrapperClasses="table-responsive" 
                    className="table-condensed table-striped table-hover"
                    fluid={true} 
                    keyField='id' 
                    data={this.state.posts} 
                    columns={ this.columns } 
                    />
                      }
                      {(this.state.posts===null && this.state.tableLoading)
                      && <Spinner/>}
                 <Pagination aria-label="Page navigation example">
            
              <PaginationItem className="text-black-always">
                <PaginationLink className="text-black-always"
                title={this.state.currentPage <= 1?"You are on the first page":"Go back one page"}
                previous disabled={this.state.currentPage <= 1?true:false} onClick={()=>{
                    this.fetchNewPage(this.state.currentPage-1, this.state.numberOfEntries)
                    this.setState({currentPage:this.state.currentPage-1})
                    }}/>
              </PaginationItem>
             {this.state.pages!==null && this.generatePagination()}
             <PaginationItem>
                <PaginationLink 
                title={this.state.currentPage >= this.state.numberOfPages?"You are on the last page":"Advance one page"}
                next 
                disabled={this.state.currentPage >= this.state.numberOfPages?true:false}
                onClick={()=>{
                this.fetchNewPage(this.state.currentPage+1, this.state.numberOfEntries)
                this.setState({currentPage: this.state.currentPage+1})
            }} />
              </PaginationItem>
                </Pagination>
               
                    </Col>
                </Row>
                </div>
                </Container>
            </div>
        );
    }
} AdminDashboard.propTypes = {};

export default AdminDashboard;
