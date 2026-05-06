import React, { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import "../App.css";

function Controls() {

    var context = useContext(SettingsContext);

    var format = context.format;
    var setFormat = context.setFormat;

    var theme = context.theme;
    var setTheme = context.setTheme;

    function changeTo12() {
        setFormat("12hr");
    }

    function changeTo24() {
        setFormat("24hr");
    }

    function setLight() {
        setTheme("light");
    }

    function setDark() {
        setTheme("dark");
    }

    return (
        <div className="controls-container">
            <div className="control-section">
                <h2 className="control-label">Format: {format}</h2>
                <div className="button-group">
                    <button className={`control-button ${format === "12hr" ? "active" : ""}`} onClick={changeTo12}>12 Hour</button>
                    <button className={`control-button ${format === "24hr" ? "active" : ""}`} onClick={changeTo24}>24 Hour</button>
                </div>
            </div>

            <div className="control-section">
                <h2 className="control-label">Theme: {theme}</h2>
                <div className="button-group">
                    <button className={`control-button ${theme === "light" ? "active" : ""}`} onClick={setLight}>Light</button>
                    <button className={`control-button ${theme === "dark" ? "active" : ""}`} onClick={setDark}>Dark</button>
                </div>
            </div>
        </div>
    );
}

export default Controls;