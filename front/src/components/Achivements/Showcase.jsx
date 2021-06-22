import React, {useState} from 'react';

import Carousel from 'react-elastic-carousel';
import {Spinner} from 'reactstrap';
import api from '../../constants/api';
import './Achivements.css';

function Showcase(props) {
    const [showcase, setShowCase] = useState(null)
    React.useEffect(() => {
        setShowCase(props.showcase);
    }, [props.showcase])
    //compute items to show if it's lesser than 3
    if(showcase === null){return(<Spinner/>)}
    return (
        <div >
            <Carousel
                className="achivements-dots"
                showArrows={false}
                showEmptySlots={true}
                renderPagination={false}
                itemsToShow={showcase.length>=3?3:showcase.length}>
               {ShowcaseHelper(showcase)}
            </Carousel>
        </div>
    )
}

function ShowcaseHelper(showcase){

    return showcase.map(element=>{
        return(
        <div><img src={api.cdn+'/'+element.media[0]} style={{width:'30px', height:'30px'}} title={element.name}></img></div>    
        )
    })
}


export default Showcase;
