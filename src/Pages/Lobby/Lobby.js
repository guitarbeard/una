import React from "react";

// Lobby is the parent component. Home and Room are the children components.
const Lobby = (props) => {
  return (
    <div>
      <h1>UNA</h1>
      {props.children}
    </div>
  );
};

export default Lobby;