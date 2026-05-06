import React, { useContext } from "react";
import Clock from "./Clock";
import Controls from "./Controls";
import { SettingsContext } from "../context/SettingsContext";

function Dashboard() {

    var context = useContext(SettingsContext);
    var theme = context.theme;

    var styleClass = theme === "dark" ? "dashboard-dark" : "dashboard-light";

    return (
        <div className={`dashboard ${styleClass}`}>
            <h1 className="dashboard-title">Dashboard</h1>
            <Clock />
            <Controls />
        </div>
    );
}

export default Dashboard;