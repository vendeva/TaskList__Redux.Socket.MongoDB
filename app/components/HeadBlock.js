import React from "react";
import PropTypes from "prop-types";
import socket from "../socket.js";
import { completeAllTodosSocket } from "../actions";
import Header from "./Header";
import Link from "../containers/Link";
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/TodoFilters";

const LinkTitles = {
    [SHOW_ALL]: "All",
    [SHOW_ACTIVE]: "Active",
    [SHOW_COMPLETED]: "Completed",
};

const HeadBlock = ({ todosCount, completedCount, todos }) =>
    !!todosCount && (
        <>
            <div className="task__info">
                <label className="task__check">
                    <input
                        className="input-check"
                        type="checkbox"
                        checked={completedCount === todosCount}
                        onChange={() => completeAllTodosSocket(socket, todos)}
                    />
                    <svg
                        className="icon-check  icon-check_size"
                        xmlns="http://www.w3.org/2000/svg"
                        xlinkHref="http://www.w3.org/1999/xlink"
                        viewBox="0 0 25 25"
                    >
                        <use href="#check__box" className="icon-check__box"></use>
                        <use href="#check__yes" className="icon-check__yes"></use>
                        <use href="#check__circle" className="icon-check__circle"></use>
                    </svg>
                </label>
                <Header completedCount={completedCount} activeCount={todosCount - completedCount} />
            </div>
            <div className="links">
                {Object.keys(LinkTitles).map((filter) => (
                    <Link key={filter} filter={filter}>
                        {LinkTitles[filter]}
                    </Link>
                ))}
            </div>
        </>
    );

HeadBlock.propTypes = {
    todosCount: PropTypes.number.isRequired,
    completedCount: PropTypes.number.isRequired,
    todos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
            text: PropTypes.string.isRequired,
        }).isRequired
    ),
};

export default HeadBlock;
