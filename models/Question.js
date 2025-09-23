const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionSchema = new Schema(
	{
		text: { type: String, required: true, trim: true, index: 'text' },
		options: {
			type: [String],
			validate: {
				validator: function (arr) {
					return Array.isArray(arr) && arr.length >= 2;
				},
				message: 'A question must have at least two options.'
			},
			required: true,
		},
		keywords: { type: [String], index: true, default: [] },
		correctAnswerIndex: {
			type: Number,
			required: true,
			validate: {
				validator: function (v) {
					if (!Array.isArray(this.options)) return true;
					return Number.isInteger(v) && v >= 0 && v < this.options.length;
				},
				message: 'correctAnswerIndex must be a valid index in options array.'
			},
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
