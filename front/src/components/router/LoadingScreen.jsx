import React from 'react';
import Spinner from 'react-spinkit'
import './LoadingScreen.css'

class LoadingScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: true
        }
    }

    render() {
        return (
            <div className="load">
                <div id="spin-logo">
                    <Spinner name="folding-cube" color="white" fadeIn='half'/>
                </div>
            </div>
        )
    }
}

export default LoadingScreen;
