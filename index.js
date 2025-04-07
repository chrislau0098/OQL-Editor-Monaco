const ohm = require('ohm-js');
const editor = monaco.editor.create(document.getElementById('editor'), {
  value: '',
  language: 'onesql',
  theme: 'vs-dark'
});

editor.onDidChangeModelContent(() => {
  const value = editor.getValue();
  const match = grammar.match(value);
  if (!match.succeeded()) {
    monaco.editor.setModelMarkers(editor.getModel(), 'onesql', [{
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1000,
      message: match.message,
      severity: monaco.MarkerSeverity.Error
    }]);
  } else {
    monaco.editor.setModelMarkers(editor.getModel(), 'onesql', []);
  }
});

export const registerONESQLLanguage = () => {
  // 注册语言
  monaco.languages.register({ id: 'onesql' });

  // 设置语法高亮规则
  monaco.languages.setMonarchTokensProvider('onesql', {
    defaultToken: '',
    tokenPostfix: '.onesql',

    keywords: [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT',
      'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||'
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // 标识符和关键字
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],

        // 空白字符
        [/[ \t\r\n]+/, 'white'],

        // 数字
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],

        // 字符串
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

        // 运算符
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': 'delimiter'
          }
        }],
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },
  });
};