import React from "react";

// Lobby is the parent component. Home and Room are the children components.
const Lobby = (props) => {
  return (
    <main className="container">
      {props.children}
    </main>
  );
};

export default Lobby;