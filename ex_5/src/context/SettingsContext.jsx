import React, { createContext, useState } from "react";

var SettingsContext = createContext();

function SettingsProvider(props) {

    var [format, setFormat] = useState("24hr");
    var [theme, setTheme] = useState("light"); 

    return (
        <SettingsContext.Provider value={{ format: format, setFormat: setFormat ,theme: theme,setTheme:setTheme}}>
            {props.children}
        </SettingsContext.Provider>
    );
}

export { SettingsContext, SettingsProvider };