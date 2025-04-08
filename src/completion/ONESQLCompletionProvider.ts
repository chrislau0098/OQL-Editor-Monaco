import * as monaco from 'monaco-editor';
import { 
  ONESQL_FIELDS, 
  ONESQL_KEYWORDS, 
  ONESQL_OPERATORS, 
  ONESQL_FUNCTIONS,
  FIELD_TYPES,
  OPERATOR_FIELD_TYPES,
  FUNCTION_FIELD_TYPES
} from '../constants/onesql';

type ONESQLField = typeof ONESQL_FIELDS[number];
type ONESQLOperator = typeof ONESQL_OPERATORS[number];
type ONESQLFunction = typeof ONESQL_FUNCTIONS[number];
type FieldType = keyof typeof FIELD_TYPES;

// 创建补全项的工具函数 (增强版)
function createCompletionItem(
  label: string,
  kind: monaco.languages.CompletionItemKind,
  range: monaco.IRange,
  detail?: string,
  documentation?: string,
  insertText?: string,
  sortText?: string,
  insertTextRules?: monaco.languages.CompletionItemInsertTextRule
): monaco.languages.CompletionItem {
  return {
    label,
    kind,
    detail,
    documentation,
    insertText: insertText || label,
    sortText: sortText || label,
    range,
    insertTextRules
  };
}

// 获取字段类型的补全项
function getFieldTypeCompletions(field: ONESQLField, range: monaco.IRange): monaco.languages.CompletionItem[] {
  const completions: monaco.languages.CompletionItem[] = [];
  
  // 查找字段所属的类型
  for (const [type, fields] of Object.entries(FIELD_TYPES)) {
    if (fields.includes(field)) {
      // 根据字段类型添加相应的运算符补全
      for (const [op, types] of Object.entries(OPERATOR_FIELD_TYPES)) {
        if (types.includes(type as FieldType)) {
          completions.push(
            createCompletionItem(
              op,
              monaco.languages.CompletionItemKind.Operator,
              range,
              `运算符: ${op}`,
              `可用于 ${type} 类型字段的运算符`
            )
          );
        }
      }
      
      // 根据字段类型添加相应的函数补全
      for (const [func, types] of Object.entries(FUNCTION_FIELD_TYPES)) {
        if (types.includes(type as FieldType)) {
          completions.push(
            createCompletionItem(
              func,
              monaco.languages.CompletionItemKind.Function,
              range,
              `函数: ${func}`,
              `可用于 ${type} 类型字段的函数`
            )
          );
        }
      }
      
      break;
    }
  }
  
  return completions;
}

// 获取函数参数的补全项
function getFunctionArgCompletions(func: ONESQLFunction, range: monaco.IRange): monaco.languages.CompletionItem[] {
  const completions: monaco.languages.CompletionItem[] = [];
  
  // 根据函数类型添加相应的参数补全
  switch (func) {
    case 'IS_EMPTY':
    case 'IS_NOT_EMPTY':
    case 'IS_NULL':
    case 'IS_NOT_NULL':
      // 这些函数不需要参数
      break;
    case 'membersOf':
      completions.push(
        createCompletionItem(
          '"群组名称"',
          monaco.languages.CompletionItemKind.Value,
          range,
          '群组名称',
          '输入群组名称，例如："测试"'
        )
      );
      break;
    case 'currentUser':
    case 'currentLogin':
    case 'lastLogin':
    case 'now':
      // 这些函数不需要参数
      break;
    case 'startOfDay':
    case 'startOfWeek':
    case 'startOfMonth':
    case 'startOfSeason':
    case 'startOfYear':
    case 'endOfDay':
    case 'endOfWeek':
    case 'endOfMonth':
    case 'endOfSeason':
    case 'endOfYear':
      completions.push(
        createCompletionItem(
          '"+/-nn(y|M|w|d|h|m)"',
          monaco.languages.CompletionItemKind.Value,
          range,
          '相对时间',
          '例如："+3d" 表示 3 天后'
        )
      );
      break;
    case 'releasedVersions':
    case 'unreleasedVersions':
      completions.push(
        createCompletionItem(
          '"项目名称"',
          monaco.languages.CompletionItemKind.Value,
          range,
          '项目名称',
          '例如："路线图"'
        ),
        createCompletionItem(
          '"版本标题"',
          monaco.languages.CompletionItemKind.Value,
          range,
          '版本标题',
          '例如："V6"'
        )
      );
      break;
    case 'inprogressSprints':
    case 'doneSprints':
    case 'todoSprints':
      // 这些函数不需要参数
      break;
    case 'issueHistory':
      completions.push(
        createCompletionItem(
          'n',
          monaco.languages.CompletionItemKind.Value,
          range,
          '数量',
          '最近查看的工作项数量，例如：10'
        )
      );
      break;
    case 'standardIssueTypes':
    case 'subIssueTypes':
      // 这些函数不需要参数
      break;
  }
  
  return completions;
}

// 获取当前上下文的补全项 (修复 trim 问题)
function getContextAwareCompletions(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): monaco.languages.CompletionItem[] {
  const textUntilPosition = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  });

  const wordInfo = model.getWordUntilPosition(position);
  const range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: wordInfo.startColumn,
    endColumn: wordInfo.endColumn
  };

  // 先检查带空格的 ORDER BY，再 trim
  const upperTextUntilPosition = textUntilPosition.toUpperCase(); // Case-insensitive check
  console.log(`[DEBUG] Uppercase text before cursor: "${upperTextUntilPosition}"`);
  console.log(`[DEBUG] Ends with 'ORDER BY ': ${upperTextUntilPosition.endsWith('ORDER BY ')}`);
  console.log(`[DEBUG] Ends with 'ORDER BY\t': ${upperTextUntilPosition.endsWith('ORDER BY\t')}`);

  if (upperTextUntilPosition.endsWith('ORDER BY ') || upperTextUntilPosition.endsWith('ORDER BY\t')) {
    console.log('[DEBUG] Context matched: After ORDER BY (before trim)');
    return ONESQL_FIELDS.map(field =>
      createCompletionItem(
        field,
        monaco.languages.CompletionItemKind.Field,
        range,
        `字段: ${field}`,
        undefined,
        `${field} ` // Insert field + space
      )
    );
  }

  // 如果上面不匹配，现在可以 trim 并进行其他检查
  const normalizedText = textUntilPosition.trim().toUpperCase(); 
  console.log(`[DEBUG] Normalized (trimmed) text: "${normalizedText}"`);

  // 检查是否在 ORDER BY field 后面需要 ASC/DESC
  const orderByFieldMatch = normalizedText.match(/ORDER\s+BY\s+([A-Z_\u4E00-\u9FFF][A-Z0-9_\u4E00-\u9FFF]*)$/i);
  // 注意：正则表达式移除了末尾的 \s+，因为 normalizedText 已经被 trim
  console.log(`[DEBUG] ORDER BY Field regex match (on trimmed):`, orderByFieldMatch);
  if (orderByFieldMatch) {
    const potentialField = orderByFieldMatch[1];
    console.log(`[DEBUG] Potential field after ORDER BY: ${potentialField}`);
    const isKnownField = ONESQL_FIELDS.some(f => f.toUpperCase() === potentialField.toUpperCase());
    console.log(`[DEBUG] Is known field: ${isKnownField}`);
    if (isKnownField) {
      console.log('[DEBUG] Context matched: After ORDER BY Field');
      // 在这里，用户刚刚输入完字段名，还没输入空格，因此建议 ASC/DESC
      // Range 应该替换掉字段名
      const fieldRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column - potentialField.length, // 假设字段紧挨着光标
        endColumn: position.column
      };
      return [
        createCompletionItem(
          'ASC',
          monaco.languages.CompletionItemKind.Keyword,
          fieldRange, // Use fieldRange to replace the field name
          '升序排序',
          undefined,
          'ASC' // 只插入 ASC
        ),
        createCompletionItem(
          'DESC',
          monaco.languages.CompletionItemKind.Keyword,
          fieldRange, // Use fieldRange to replace the field name
          '降序排序',
          undefined,
          'DESC' // 只插入 DESC
        )
      ];
    }
  }

  // 简单的示例：检查是否在 = 后面
  console.log(`[DEBUG] Ends with '= ': ${normalizedText.endsWith('= ')}`);
  if (normalizedText.endsWith('= ')) {
     console.log('[DEBUG] Context matched: After =');
     // Range 应该替换触发补全的部分（可能是空）
     return [
       createCompletionItem('"value"', monaco.languages.CompletionItemKind.Value, range, '字符串值'),
       createCompletionItem('123', monaco.languages.CompletionItemKind.Value, range, '数值'),
       ...ONESQL_FUNCTIONS.map(func => createCompletionItem(func, monaco.languages.CompletionItemKind.Function, range, `函数: ${func}`)),
       createCompletionItem('EMPTY', monaco.languages.CompletionItemKind.Keyword, range, '特殊值'),
       createCompletionItem('NULL', monaco.languages.CompletionItemKind.Keyword, range, '特殊值'),
       createCompletionItem('TRUE', monaco.languages.CompletionItemKind.Keyword, range, '布尔值'),
       createCompletionItem('FALSE', monaco.languages.CompletionItemKind.Keyword, range, '布尔值')
     ];
  }

  // 默认/回退逻辑：提供所有顶级建议
  console.log('[DEBUG] Context matched: Default');
  return [
    ...ONESQL_FIELDS.map(field =>
      createCompletionItem(
        field,
        monaco.languages.CompletionItemKind.Field,
        range,
        `字段: ${field}`
      )
    ),
    ...ONESQL_KEYWORDS.map(keyword =>
      createCompletionItem(
        keyword,
        monaco.languages.CompletionItemKind.Keyword,
        range,
        `关键字: ${keyword}`
      )
    ),
    ...ONESQL_FUNCTIONS.map(func =>
      createCompletionItem(
        func,
        monaco.languages.CompletionItemKind.Function,
        range,
        `函数: ${func}`
      )
    )
  ];
}

// 注册 ONESQL 语言的补全提供者
export function registerONESQLCompletionProvider(): monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider('onesql', {
    triggerCharacters: [' ', '.', '=', '>', '<', '!', '~', '(', ')', ','], // 添加空格作为触发器

    provideCompletionItems: (model, position, context, token) => {
      // 获取当前单词的信息，用于确定替换范围
      const wordInfo = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: wordInfo.endColumn
      };

      const completions = getContextAwareCompletions(model, position);

      // 更新所有建议的 range
      const suggestions = completions.map(c => ({ ...c, range }));

      return {
        suggestions: suggestions,
        incomplete: false
      };
    }
  });
} 