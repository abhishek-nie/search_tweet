import React,{useState,useEffect} from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import socketIOClient from "socket.io-client";
import CardComponent from './CardComponent';

function TweetList() {
  const [searchTerm, setsearchTerm] = useState('')
  const [items, setitems] = useState([])
  function handleChange(e) {
    setsearchTerm(e.target.value);
  }
  
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleResume();
    }
  }
  
  function handleResume() {
    let term = searchTerm;
    fetch("/setSearchTerm",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ term })
      })
  }
  
  function handlePause(e) {
    fetch("/pause",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      })
  }
  useEffect(() => {
    const socket = socketIOClient('http://localhost:3000/');

    socket.on('connect', () => {
      console.log("Socket Connected");
      socket.on("tweets", data => {
        console.info(data);
        let newList = [data].concat(items.slice(0, 15));
        setitems({ items: newList });
      });
    });
    socket.on('disconnect', () => {
      socket.off("tweets")
      socket.removeAllListeners("tweets");
      console.log("Socket Disconnected");
    });
  },[])

  let itemsCards = <CSSTransitionGroup
    transitionName="example"
    transitionEnterTimeout={500}
    transitionLeaveTimeout={300}>
    {items.map((x, i) =>
      <CardComponent key={i} data={x} />
    )}
  </CSSTransitionGroup>;

  let searchControls =
    <div>
      <input id="email" type="text" className="validate" value={searchTerm} onKeyPress={handleKeyPress} onChange={handleChange} />
      <label htmlFor="email">Search</label>
    </div>

  let filterControls = <div>
    <a className="btn-floating btn-small waves-effect waves-light pink accent-2" style={controlStyle} onClick={handleResume}><i className="material-icons">play_arrow</i></a>
    <a className="btn-floating btn-small waves-effect waves-light pink accent-2" onClick={handlePause} ><i className="material-icons">pause</i></a>
    <p>
      <input type="checkbox" id="test5" />
      <label htmlFor="test5">Retweets</label>
    </p>
  </div>

  let controls = <div>
    {
      items.length > 0 ? filterControls : null
    }
  </div>

  let loading = <div>
    <p className="flow-text">Listening to Streams</p>
    <div className="progress lime lighten-3">
      <div className="indeterminate pink accent-1"></div>
    </div>
  </div>
  return (
    <div className="row">
      <div className="col s12 m4 l4">
        <div className="input-field col s12">
          {searchControls}
          {
            items.length > 0 ? controls : null
          }
        </div>
      </div>
      <div className="col s12 m4 l4">
        <div>
          {
            items.length > 0 ? itemsCards : loading
          }

        </div>

      </div>
      <div className="col s12 m4 l4">
      </div>
    </div>
  );
        }
const controlStyle = {
  marginRight: "5px"
}
export default TweetList