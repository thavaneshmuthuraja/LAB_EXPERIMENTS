import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import "../App.css";

function Clock() {

    // 🔹 State for time
    var [time, setTime] = useState({
        h: new Date().getHours(),
        m: new Date().getMinutes(),
        s: new Date().getSeconds()
    });

    // 🔹 Get format from context
    var context = useContext(SettingsContext);
    var format = context.format;

    // 🔹 Update time every second
    function updateTime() {
        var now = new Date();

        setTime({
            h: now.getHours(),
            m: now.getMinutes(),
            s: now.getSeconds()
        });
    }

    // 🔹 Run interval
    useEffect(function () {
        var interval = setInterval(updateTime, 1000);

        return function () {
            clearInterval(interval);
        };
    }, []);

    // 🔹 Format numbers (add leading zero)
    function formatNumber(num) {
        if (num < 10) {
            return "0" + num;
        }
        return num;
    }

    // 🔹 Extract values
    var hour = time.h;
    var minute = time.m;
    var second = time.s;
    var ampm = "";

    // 🔹 12hr / 24hr logic
    if (format === "12hr") {

        if (hour >= 12) {
            ampm = "PM";
        } else {
            ampm = "AM";
        }

        if (hour > 12) {
            hour = hour - 12;
        }

        if (hour === 0) {
            hour = 12;
        }
    }

    // 🔹 Apply leading zeros
    hour = formatNumber(hour);
    minute = formatNumber(minute);
    second = formatNumber(second);

    return (
        <div className="clock-container">
            <h1 className="clock-label">Clock</h1>
            <div className="clock-display">
                <span className="clock-time">{hour}</span>
                <span className="clock-separator">:</span>
                <span className="clock-time">{minute}</span>
                <span className="clock-separator">:</span>
                <span className="clock-time">{second}</span>
                {ampm && <span className="clock-ampm">{ampm}</span>}
            </div>
        </div>
    );
}

export default Clock;