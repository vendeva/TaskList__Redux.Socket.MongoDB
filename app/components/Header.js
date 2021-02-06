import React from "react";
import PropTypes from "prop-types";
import socket from "../socket.js";
import { clearCompletedSocket } from "../actions";

const Header = ({ activeCount, completedCount }) => {
    const itemWord = activeCount === 1 ? "task" : "tasks";
    return (
        <>
            <div className="task__progress">
                {activeCount || "No"} {itemWord} in progress
            </div>
            {!!completedCount && (
                <div className="task__clear" onClick={() => clearCompletedSocket(socket)}>
                    Clear completed
                </div>
            )}
        </>
    );
};

Header.propTypes = {
    activeCount: PropTypes.number.isRequired,
    completedCount: PropTypes.number.isRequired,
};
export default Header;
