module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
    }
  },
  env: {
    es6: true,
    jest: true,
    node: true,
    browser: true,
  },
  // overrides: [
  //   {
  //     files: [
  //       '.eslintrc.js',
  //       '**/__tests__/**/*.js',
  //       '**/cli-test-utils/**/*.js',
  //     ],
  //     rules: {
  //       'node/no-extraneous-require': 'off',
  //     },
  //   },
  // ],
  // extending airbnb config and config derived from eslint-config-prettier
  // https://www.npmjs.com/package/@vue/eslint-config-prettier
  // 检测rules 冲突: eslint --print-config . | eslint-config-prettier-check
  extends: ['essentials', 'prettier'],
  plugins: [
    // '@babel/preset-env',
    // 'essentials',
    'prettier',
  ],
  rules: {
    // prettier.config.js or .prettierrc.js
    // https://prettier.io/docs/en/options.html
    // https://segmentfault.com/a/1190000012909159
    'prettier/prettier': [
      'error',
      {
        // printWidth: 100,
        singleQuote: true,
        jsxBracketSameLine: true, // 是否多行JSX元素最后一行的末尾添加 > or 新起一行
        trailingComma: 'es5', // none es5 or all
        // arrowParens: 'avoid', // avoid or always 箭头函数是否总是加圆括号
        proseWrap: 'always', // 当超出print width就折行
        // parser: 'flow',
        // semi: false,
        // semicolons: true,
        // bracketSpacing: true, // 花括号内部前后有空格
      },
    ],
    // 'comma-dangle': [
    //   'error',
    //   {
    //     arrays: 'always-multiline',
    //     objects: 'always-multiline',
    //     imports: 'always-multiline',
    //     exports: 'always-multiline',
    //     functions: 'ignore',
    //   },
    // ],
    // 'max-len': ['error', {
    //   'code': 120,
    //   'ignoreUrls': true,
    //   'ignorePattern': true,
    // }],
    complexity: [
      'error',
      {
        max: 16,
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-magic-numbers': 'off',
    // 'no-magic-numbers': [
    //   'error',
    //   {
    //     ignore: [-1, 0, 1],
    //     ignoreArrayIndexes: true,
    //   },
    // ],
    'no-else-return': 'off',
    'no-mixed-operators': 'off',
    // 'no-multi-spaces': [
    //   'error',
    //   {
    //     ignoreEOLComments: true,
    //   },
    // ],
    // 'no-multiple-empty-lines': [
    //   'error',
    //   {
    //     max: 2,
    //     maxEOF: 1,
    //   },
    // ],
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': [
      'off',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'no-restricted-syntax': 'off',
    'no-shadow': [
      'error',
      {
        allow: [
          'res',
          'data',
          'err',
          'cb',
          'state',
          'resolve',
          'reject',
          'done',
        ],
      },
    ],
    'no-trailing-spaces': 'off',
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: false,
      },
    ],
    'no-use-before-define': 'off',
    'no-useless-escape': 'off',
    'prefer-template': 'off',
    'prefer-arrow-callback': 'off',
    // 'quotes': ['error', 'single', {
    //   'avoidEscape': true,
    //   'allowTemplateLiterals': true,
    // }],
    'require-yield': [1],
    // 'space-before-function-paren': [
    //   'error',
    //   {
    //     anonymous: 'always',
    //     named: 'ignore',
    //     asyncArrow: 'ignore',
    //   },
    // ],
    indent: [
      'error',
      2,
      {
        MemberExpression: 'off',
        SwitchCase: 1,
      },
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js'],
      rules: {
        'node/no-extraneous-require': 'off',
      },
    },
  ],
};
