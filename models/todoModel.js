const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// create a schema
const toDoSchema = new mongoose.Schema(
    {
        text: String,
        completed: Boolean,
        parentId: { type: Number, default: 0 },
    },
    { collection: "TodoList" }
);

toDoSchema.plugin(AutoIncrement, { inc_field: "id" });

// we need to create a model using it
module.exports = mongoose.model("ToDo", toDoSchema);
