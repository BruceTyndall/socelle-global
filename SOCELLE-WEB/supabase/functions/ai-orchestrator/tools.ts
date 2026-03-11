export const ORCHESTRATOR_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the database for retail and professional products',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to search for (e.g., "retinol", "cleanser")' },
          category: { type: 'string', description: 'Optional category filter' },
          max_price: { type: 'number', description: 'Optional max price constraint' },
        },
        required: ['query', 'category', 'max_price'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_intelligence',
      description: 'Search for market signals and industry intelligence protocols',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic to research (e.g., "microneedling safety")' },
        },
        required: ['topic'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a specific product to the user cart',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'UUID of the product' },
          variant_id: { type: 'string', description: 'UUID of the variant (if applicable, else empty string)' },
          quantity: { type: 'number', description: 'Amount to add' },
        },
        required: ['product_id', 'variant_id', 'quantity'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_user_context',
      description: 'Save an important preference or detail about the user silently in the background (e.g. "User owns 5 rooms", "They like chemical peels"). Use this proactively when the user casually mentions something that would be helpful to remember for future conversations.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          key_fact: { type: 'string', description: 'A short, declarative statement of the context to remember (e.g., "Owns a MedSpa in Miami", "Does not like retail selling")' },
        },
        required: ['key_fact'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the live internet to discover external trends, industry news, or general information not found in the SECELLE database.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The exact search string to query the internet with (e.g. "top aesthetic trends 2026")' },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
];
