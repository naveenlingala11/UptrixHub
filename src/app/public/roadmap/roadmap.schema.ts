export const ROADMAP_SCHEMA = {
  type: 'object',
  required: ['courseId', 'courseTitle', 'levels'],
  properties: {

    courseId: {
      type: 'string',               // ✅ FIXED
      minLength: 3
    },

    courseTitle: {
      type: 'string',
      minLength: 3
    },

    levels: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['level', 'topics'],
        properties: {
          level: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced']
          },
          topics: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
              minLength: 2
            }
          }
        }
      }
    }
  }
};
