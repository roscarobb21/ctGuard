import React from 'react';
import {Card,
    CardTitle,
    CardText,
    CardImg,
    CardBody,
    CardSubtitle,
CardFooter} from 'reactstrap';

import Skeleton, { SkeletonTheme }  from 'react-loading-skeleton';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

function PostItemScheleton(){
    let height = getRandomInt(100, 300)
    return(
        <div style={{width:'100%', height:height+'px'}} className="background-component">
            <div style={{borderRadius:'10px'}}>
            <Card style={{marginTop:'2vh'}} className="background-component">
                <CardBody className="background-component">
                    
                <Skeleton height={height-50} count={1} color="black" className="skeleton-theme" />
        
                </CardBody>
                <CardFooter>
                <Skeleton  count={1} className="skeleton-theme">
        </Skeleton>
                </CardFooter>
            </Card>
            </div>
        </div>
    )


}


export default PostItemScheleton;