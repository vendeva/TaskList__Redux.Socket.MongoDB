import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import socket from "../socket.js";
import classnames from "classnames";
import * as Actions from "../actions";
import { getVisibleTodos } from "../selectors";
import Input from "./Input";
import HeadBlock from "../containers/HeadBlock";
import FilteredTodoList from "../containers/FilteredTodoList";

class App extends Component {
    static propTypes = {
        getVisibleTodosCount: PropTypes.number.isRequired,
    };
    constructor(props) {
        super(props);
        const { dispatch } = this.props;

        socket.on("todoAdded", (parentId, id, text) => {
            dispatch(Actions.addTodo(parentId, id, text));
        });

        socket.on("todoEdited", (id, text, parentId) => {
            dispatch(Actions.editTodo(id, text, parentId));
        });

        socket.on("todoDeleted", (id, parentId) => {
            dispatch(Actions.deleteTodo(id, parentId));
        });

        socket.on("todoCompleted", (id, parentId) => {
            dispatch(Actions.completeTodo(id, parentId));
        });

        socket.on("todoSorted", (todos, parentId) => {
            dispatch(Actions.sortTodos(todos, parentId));
        });
        socket.on("completeAllTodos", () => {
            dispatch(Actions.completeAllTodos());
        });

        socket.on("clearCompleted", () => {
            dispatch(Actions.clearCompleted());
        });
    }

    componentDidMount() {
        this.props.dispatch(Actions.initialSocketTodos(socket));
    }

    componentWillUnmount() {
        socket.disconnect();
        alert("Disconnecting Socket as component will unmount");
    }

    render() {
        return (
            <div
                className={classnames({
                    task__container: true,
                    task__container_padding: !this.props.getVisibleTodosCount,
                })}
            >
                <div className="task__header">
                    <h1 className="task__h1 title"> Tasklist </h1>
                    <Input
                        newTodo
                        onSaveTodo={(text) => {
                            if (text.length !== 0) {
                                Actions.addTodoSocket(socket, text);
                            }
                        }}
                        placeholder="Task Enter"
                    />
                </div>
                <HeadBlock />
                <FilteredTodoList />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    getVisibleTodosCount: getVisibleTodos(state).length,
});

export default connect(mapStateToProps)(App);
