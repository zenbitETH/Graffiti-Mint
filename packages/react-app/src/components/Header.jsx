import GM from "../assets/GM.svg"
import React from "react";

// displays a page header

export default function Header() {
  return (
    <div  class="navi">
      <a href="/"><img class="logo" src={GM}/></a>
    </div>
  );
}
