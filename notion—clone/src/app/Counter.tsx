'use Client';

import {useState} from 'react';

export default function Counter() {
    /* 
        Whenever we utilise state or hooks like useState in react or CLIENT SIDE MANAGEMENT SOLUTIONS, it is important to DECLARE THE COMPONENT, as a CLIENT SIDE COMPONENT.
        
        STATE MANAGEMENT in REACT is PRIMARILY HANDLED ON THE CLIENT SIDE!
        
        Component State is managed and updated within the Browser!

        Hence, whenever we use any hook like useState, useEffect, useRef... we need to add the "use Client" at the top, otherwise we gonna run into errors!
    */
    const [count, setCount] = useState(0)

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => {setCount(count+1)}}>Click Me</button>
        </div>
    );
}