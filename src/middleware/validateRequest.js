const Joi = require('joi');

const schemas = {
  chat: Joi.object({
    user_id: Joi.string().required().min(1).max(100),
    topic_id: Joi.string().required().min(1).max(100),
    message: Joi.string().required().min(1).max(2000)
  }),

  conversationQuery: Joi.object({
    user_id: Joi.string().required().min(1).max(100)
  }),

  createTopic: Joi.object({
    topic_id: Joi.string().required().min(1).max(100).pattern(/^[a-zA-Z0-9-_]+$/),
    title: Joi.string().required().min(1).max(200),
    files: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().required()
      })
    ).min(1).required(),
    metadata: Joi.object({
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
      duration: Joi.string(),
      tags: Joi.array().items(Joi.string())
    }).optional()
  }),

  updateTopic: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    files: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().required()
      })
    ).min(1).required(),
    metadata: Joi.object({
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
      duration: Joi.string(),
      tags: Joi.array().items(Joi.string())
    }).optional()
  }),

  bulkUpload: Joi.object({
    topics: Joi.array().items(
      Joi.object({
        topic_id: Joi.string().required().min(1).max(100).pattern(/^[a-zA-Z0-9-_]+$/),
        title: Joi.string().required().min(1).max(200),
        files: Joi.array().items(
          Joi.object({
            filename: Joi.string().required(),
            content: Joi.string().required()
          })
        ).min(1).required(),
        metadata: Joi.object().optional()
      })
    ).min(1).required()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

function validate(schemaName, source = 'body') {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return next(new Error(`Unknown validation schema: ${schemaName}`));
    }

    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details
      });
    }

    req[source] = value;
    next();
  };
}

module.exports = {
  validate,
  schemas
};
