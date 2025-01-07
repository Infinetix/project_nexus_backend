const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    labels: [{ type: String }],
    dueDate: { type: Date },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    column: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);