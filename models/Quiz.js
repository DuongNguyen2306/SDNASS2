const mongoose = require('mongoose');

const { Schema } = mongoose;

const quizSchema = new Schema(
	{
		title: { type: String, required: true, trim: true, index: true },
		description: { type: String, trim: true },
		questions: [{ type: Schema.Types.ObjectId, ref: 'Question', index: true }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
