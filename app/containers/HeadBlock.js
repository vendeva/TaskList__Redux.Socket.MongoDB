import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import HeadBlock from "../components/HeadBlock";
import { getCompletedTodoCount } from "../selectors";

const mapStateToProps = (state) => ({
    todosCount: state.todos.length,
    completedCount: getCompletedTodoCount(state),
    todos: state.todos,
});

export default connect(mapStateToProps)(HeadBlock);
