import React, {useParams} from 'react';
import {useLocation} from 'react-router-dom';

function ProfileStranger() {
    // We can use the `useParams` hook here to access
    // the dynamic pieces of the URL.
    let { id } = useParams();
  
    return (
      <div>
        <h3>ID: {id}</h3>
      </div>
    );
  }

export default ProfileStranger;