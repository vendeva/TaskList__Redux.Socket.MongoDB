import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

export default class Input extends React.Component {
    static propTypes = {
        onSaveTodo: PropTypes.func.isRequired,
        newTodo: PropTypes.bool,
        text: PropTypes.string,
        placeholder: PropTypes.string,
    };

    state = {
        text: this.props.text || "",
    };

    handleChange = (e) => {
        this.setState({ text: e.target.value });
    };

    handleSubmit = (e) => {
        const text = e.target.value.trim();
        if (e.which === 13) {
            this.props.onSaveTodo(text);
            if (this.props.newTodo) {
                this.setState({ text: "" });
            }
        }
    };

    handleBlur = (e) => {
        const text = e.target.value.trim();
        if (!this.props.newTodo) {
            this.props.onSaveTodo(text);
        }
    };

    render() {
        return (
            <>
                <input
                    className={classnames({
                        input: true,
                    })}
                    type="text"
                    placeholder={this.props.placeholder}
                    autoFocus={true}
                    value={this.state.text}
                    onChange={this.handleChange}
                    onKeyDown={this.handleSubmit}
                    onBlur={this.handleBlur}
                />
            </>
        );
    }
}
