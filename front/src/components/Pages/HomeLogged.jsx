import React from 'react';
import { Row , Col} from 'reactstrap';

import Navbar from '../NavBar/Navbar';

class HomeLogged extends React.Component{
    constructor(props){
        super(props);
        this.state={

        }
    }


    render(){
        return(
            <div>
                <Row>
                    <Col>
            <Navbar/>
            </Col>
            </Row>
            <Row>
                <Col>ok</Col>
            </Row>
            </div>
        )
    }
}



export default HomeLogged;