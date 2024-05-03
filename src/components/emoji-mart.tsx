// @ts-nocheck
"use client";
import data from "@emoji-mart/data/sets/15/apple.json";

import React, { useEffect, useRef } from "react";
import { Picker } from "emoji-mart";
export default function EmojiPicker(props) {
  const ref = useRef(null);
  const instance = useRef(null);

  if (instance.current) {
    instance.current.update(props);
  }

  useEffect(() => {
    instance.current = new Picker({ ...props, ref });

    var style = document.createElement("style");
    style.innerHTML =
      ":host { display: flex; height: 200px; max-width: 288px; min-height: 230px; padding: 0; width: 100% !important; --category-icon-size: 16px; --font-size: 14px; --shadow: none; --rgb-accent:transparent} #root { --padding: 0; --sidebar-width: 0; font: inherit; padding: 0; position: relative; max-width: 288px; background: none;} #root:before { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 8px; pointer-events: none; z-index: 1; background-image: linear-gradient( #5f687200, #FFFFFF 70% ); } #nav .bar #nav:before { display: none; } #nav button { color: #8e939a; } #nav button:hover { color: #616870; } #nav button[aria-selected] { color: #27272B; } .padding-lr > div > .spacer { display: none; } .search { margin: 4px 0; } .search input[type='search'] { appearance: none; color: #27272B; background-color: var(--input-background, #f5f7fa) !important; border: none; width: 100%; font-family: inherit; margin: 0; display: block; outline: none; position: relative; border-radius: 9px; padding: 6px 8px; line-height: 20px; font-size: 14px; transition: background-color 0.15s, box-shadow 0.15s, color 0.15s; box-shadow: inset 0 0 0 var(--input-border, 1px) var(--input-border-color, transparent), 0 1px 1px 0 var(--input-shadow, transparent); } .search .icon { display: none; } .search input[type='search']:hover { --input-border-color: #e7e9ec; } .search input[type='search']:focus { --input-border: 2px; --input-border-color: #008FFD; --input-shadow: rgba(0 0 0 / 12%); --input-background: #FFFFFF; } .search input::placeholder { color: #b0b4ba; } .search input::-webkit-search-decoration .search input::-webkit-search-cancel-button .search input::-webkit-search-results-button .search input::-webkit-search-results-decoration { appearance: none; } .category:last-child { margin-bottom: 8px; } .category .sticky { position: sticky; z-index: 1; top: 0; font-size: 12px; font-weight: 600; line-height: 20px; padding: 8px 0; color: #8e939a; background-image: linear-gradient( #FFFFFF 65%, #5f687200 ); background-color: transparent; backdrop-filter: none; } .category button { appearance: none; width: 100%; height: 36px; padding: 0; margin: 0; display: flex; justify-content: center; align-items: center; border: none; background: none; cursor: pointer; outline: none; border-radius: 9px; transition: box-shadow 0.2s; } .category button:hover { box-shadow: inset 0 0 0 2px #b0b4ba; } .category button .background { display: none; } .category button:active { --emoji-scale: 0.9; } .category button span { display: block; transform: scale(var(--emoji-scale, 1)) translateZ(0); transition: transform 0.2s; text-align: center; }";
    instance.current.shadowRoot.appendChild(style);

    return () => {
      instance.current = null;
    };
  }, []);
  return <div ref={ref} />;
  // return React.createElement("div", { ref });
}
