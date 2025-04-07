import * as monaco from 'monaco-editor';
import { ONESQL_FIELDS, ONESQL_KEYWORDS, ONESQL_OPERATORS, ONESQL_FUNCTIONS } from '../constants/onesql';

// 定义 ONESQL 语言的语法高亮规则 (暗色主题，参考 VS Code)
export const ONESQLTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // 字段 - 蓝色，与变量类似
    { token: 'field', foreground: '9CDCFE', },
    // 关键字 - 紫色，类似 VS Code 的关键字
    { token: 'keyword', foreground: 'C586C0' },
    // 运算符 - 亮灰色
    { token: 'operator', foreground: 'D4D4D4' },
    // 函数 - 黄色，与 VS Code 函数调用类似
    { token: 'function', foreground: 'DCDCAA' },
    // 字符串 - 橙红色
    { token: 'string', foreground: 'CE9178' },
    // 数字 - 浅青色
    { token: 'number', foreground: 'B5CEA8' },
    // 布尔值和特殊值 - 蓝色
    { token: 'boolean', foreground: '569CD6' },
    { token: 'special', foreground: '569CD6' },
    // 注释 - 绿色
    { token: 'comment', foreground: '6A9955' },
    // 定界符 - 括号和逗号
    { token: 'delimiter', foreground: 'D4D4D4' },
    // 默认标记 - 为了确保未标记的文本也有样式
    { token: '', foreground: 'D4D4D4' },
    { token: 'identifier', foreground: 'D4D4D4' }
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#C6C6C6',
    'editorCursor.foreground': '#AEAFAD',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41',
    'editorSuggestWidget.background': '#252526',
    'editorSuggestWidget.border': '#454545',
    'editorSuggestWidget.foreground': '#D4D4D4',
    'editorSuggestWidget.selectedBackground': '#062F4A',
    'editorSuggestWidget.highlightForeground': '#0097FB',
    'list.hoverBackground': '#2A2D2E',
    'list.focusBackground': '#062F4A'
  }
};

// 关键字预处理 - 确保不会部分匹配，并包含 ORDER BY, ASC, DESC
const allKeywords = [...ONESQL_KEYWORDS, 'ORDER BY', 'ASC', 'DESC'];
const escapedKeywords = allKeywords.map(keyword =>
  keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Standard regex escape
);

// 操作符预处理 - 特殊字符需要转义
const escapedOperators = ONESQL_OPERATORS.map(op =>
  op.replace(/[.*+?^${}()|[\]\\=<>!~]/g, '\\$&') // Include =<>!~ in escape set
);

// 函数名预处理
const escapedFunctionNames = ONESQL_FUNCTIONS.map(fn =>
  fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Removed trailing \n
);

// 定义 ONESQL 语言的词法分析器
export const ONESQLMonarchLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: 'identifier',
  ignoreCase: true,
  keywords: allKeywords,
  operators: ONESQL_OPERATORS,
  tokenizer: {
    root: [
      // 字符串
      [/^'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string_single'],
      [/^"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],

      // 数字
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/\d+([eE][-+]?\d+)?/, 'number'],

      // 关键字
      [/\b(?:ORDER\s+BY)\b/i, 'keyword'],
      [new RegExp(`\\b(${escapedKeywords.filter(k => k !== 'ORDER BY').join('|')})\\b`, 'i'), 'keyword'],

      // 字段 - 显式列出每个字段以提高可靠性
      [/\b标题\b/, 'field'],
      [/\b创建时间\b/, 'field'],
      [/\b创建者\b/, 'field'],
      [/\b更新时间\b/, 'field'],
      [/\b工作项类型\b/, 'field'],
      [/\b子工作项类型\b/, 'field'],
      [/\b所属项目\b/, 'field'],
      [/\b处理结果\b/, 'field'],
      [/\b发布进度\b/, 'field'],
      [/\b发布日期\b/, 'field'],
      [/\b负责人\b/, 'field'],
      [/\b故事点\b/, 'field'],
      [/\b关联发布\b/, 'field'],
      [/\b所属史诗\b/, 'field'],
      [/\bID\b/, 'field'],
      [/\b截止日期\b/, 'field'],
      [/\b解决者\b/, 'field'],
      [/\b缺陷类型\b/, 'field'],
      [/\b是否线上缺陷\b/, 'field'],
      [/\b所属产品\b/, 'field'],
      [/\b所属迭代\b/, 'field'],
      [/\b描述\b/, 'field'],
      // [new RegExp(`\\b(${ONESQL_FIELDS.join('|')})\\b`), 'field'], // Original rule commented out

      // 函数调用
      [new RegExp('\\b(' + escapedFunctionNames.join('|') + ')\\s*\\(', 'i'), 'function'],

      // 运算符
      [new RegExp(`(${escapedOperators.join('|')})`), 'operator'],

      // 特殊值
      [/\b(TRUE|FALSE)\b/i, 'boolean'],
      [/\b(EMPTY|NULL)\b/i, 'special'],

      // 注释
      [/\/\/.*$/, 'comment'],

      // 定界符
      [/[()]/, 'delimiter.parenthesis'],
      [/,/, 'delimiter.comma'],

      // 标识符 (作为后备)
      [/[a-zA-Z_\u00A0-\uFFFF][\w\u00A0-\uFFFF]*/, 'identifier'],

      // 空白
      [/[ \t\r\n]+/, 'white'],
    ],
    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop']
    ],
    string_single: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'/, 'string', '@pop']
    ]
  }
};

// 注册 ONESQL 语言和主题
export function registerONESQLLanguage() {
  // 清理现有注册（如果需要） - 避免重复注册可能导致的问题
  // 注意：频繁清理和重置可能影响性能，通常只在开发或调试时需要
  // try {
  //   monaco.editor.getModels().forEach(model => model.dispose());
  //   monaco.languages.register({ id: 'onesql' }); // 重新注册以确保干净状态
  // } catch (e) {
  //   console.warn('清理 Monaco 资源时出错:', e);
  // }

  // 注册语言（如果尚未注册）
  try {
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'onesql')) {
      monaco.languages.register({ id: 'onesql' });
    }
    
    // 设置词法提供者
    monaco.languages.setMonarchTokensProvider('onesql', ONESQLMonarchLanguage);
    
    // 定义和设置主题
    monaco.editor.defineTheme('onesql', ONESQLTheme);
    
    // 确保应用主题
    monaco.editor.setTheme('onesql');
    
    console.log('成功注册 ONESQL 语言和主题');
  } catch(e) {
    console.error('ONESQL语言注册或主题应用错误:', e);
  }
} 