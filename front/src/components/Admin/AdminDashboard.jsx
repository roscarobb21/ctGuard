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
    Button
} from 'reactstrap';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import NavBar from '../NavBar/Navbar';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

import api from '../../constants/api';

import './Admin.css'


class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingData:false,
            categoryFilterDrop: "Category",
            stateFilterDrop: "State",
            posts:null,
            pages:null,
            tableLoading:true,
            postsDrop:"Posts per page",
            currentPage:1,
            numberOfEntries:5,
        }

    }
    fetchDataWithFilters= async ()=>{
        this.setState({tableLoading:true})
        let url = api+'/admin/post?number='+5+'&page='+this.state.currentPage;
        this.state.categoryFilterDrop!=="Category"?url+="&category="+this.state.categoryFilterDrop:null;
        this.state.stateFilterDrop!=="State"?url+="&status="+this.state.stateFilterDrop:null;
        document.getElementById("dateFilter").value!==""?url+="&date="+document.getElementById("dateFilter").value:null;
       
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
        console.log("RESPONSE : , ", response)
        let checkResponse = response.posts.length>0?response.posts:[{header:"No posts available"}]
        setTimeout(function(){
            this.setState({posts:checkResponse, tableLoading:false, pages:response.pages, numberOfEntries: 5})
        }.bind(this), 1500)
        //this.setState({posts:checkResponse, tableLoading:false, pages:response.pages, numberOfEntries: 5})
    }

   async componentWillMount(){
    let url = api+'/admin/post';
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
    this.setState({posts:response.posts, tableLoading:false, pages:response.pages});
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
        dataField: 'datePosted',
        text: 'Date Posted'
      }, {
        dataField: 'status',
        text: 'Status'
      }, {
        dataField: 'upVotes',
        text: 'Up votes'
      }, {
        dataField: 'followers',
        text: 'Followers'
      }];
    data=[{
        _id:"asdasdqweassdsadqwesadasd",
        header:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        body:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        postedBy:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        datePosted:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        status:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        upVotes:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        followers:'x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ'
    }]
    fetchNewPage= async (page, entries)=>{
        if(entries === undefined){
            entries=this.state.numberOfEntries;
        }
        console.log("DATE INPUT : ", typeof document.getElementById("dateFilter").value)
        this.setState({tableLoading:true, currentPage:page, posts:null})
        let url = api+'/admin/post?number='+entries+'&page='+page;
        this.state.categoryFilterDrop!=="Category"?url+="&category="+this.state.categoryFilterDrop:null;
        this.state.stateFilterDrop!=="State"?url+="&status="+this.state.stateFilterDrop:null;
        document.getElementById("dateFilter").value!==""?url+="&date="+document.getElementById("dateFilter").value:null;
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
        this.setState({posts:response.posts, tableLoading:false, pages:response.pages, numberOfEntries: entries!== undefined?entries:5})
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
            <div>
                <NavBar/>
                <span className="text-header2">Welcome to ctGuard management</span>
              
                <Row>
                    <Col md="12" lg="2" className="admin-dash-filters-section">

                        <div style={
                            {height: '500px'}
                        }>
                            <Row>
                                <Col></Col>
                                <Col>
                                    <span className="text-header2">Filters:
                                    </span>
                                </Col>
                                <Col></Col>
                            </Row>
                            <Row>
                                <Col className="float-left">
                                    <p>Category filter</p>
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
                            </Row>

                            <Row className="m-3">
                                <Col>
                                    <p>State filter</p>
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
                                                    this.setState({stateFilterDrop: "In Progress"})
                                                }
                                            }>In Progress</DropdownItem>
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
                                                    this.setState({stateFilterDrop: "State"})
                                                }
                                            }>Delete filter</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Col>
                            </Row>
                            <Row className="m-3">
                                <Col>
                                    <Form>
                                        <FormGroup>
                                            <Label for="dateFilter">Date posted</Label>
                                            <Input type="date" name="date" id="dateFilter" placeholder="date placeholder"/>
                                        </FormGroup>
                                    </Form>
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

                    <Col md="12" lg="10" className="admin-dash-table-section">
                    <Row>
                <UncontrolledDropdown style={{padding:'20px'}}>
      <DropdownToggle caret>
        {this.state.numberOfEntries}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={()=>{this.fetchNewPage(1, 5)}} >5</DropdownItem>
        <DropdownItem onClick={()=>{this.fetchNewPage(1, 10)}}>10</DropdownItem>
        <DropdownItem onClick={()=>{this.fetchNewPage(1, 15)}}>15</DropdownItem>
        <DropdownItem onClick={()=>{this.fetchNewPage(1, 20)}}>20</DropdownItem>
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
                <PaginationItem>
                <PaginationLink first href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink previous href="#" />
              </PaginationItem>
             {this.state.pages!==null && this.generatePagination()}
             <PaginationItem>
                <PaginationLink next href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink last href="#" />
              </PaginationItem>
                </Pagination>
               
                    </Col>
                </Row>
            </div>
        );
    }
} AdminDashboard.propTypes = {};

export default AdminDashboard;
