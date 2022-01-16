import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a  href="/App" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🛹 Graffiti Mint"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
