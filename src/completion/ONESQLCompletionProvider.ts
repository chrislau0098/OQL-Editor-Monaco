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

// 创建补全项的工具函数
function createCompletionItem(
  label: string,
  kind: monaco.languages.CompletionItemKind,
  detail?: string,
  documentation?: string,
  insertText?: string,
  sortText?: string
): monaco.languages.CompletionItem {
  return {
    label,
    kind,
    detail,
    documentation,
    insertText: insertText || label,
    sortText: sortText || label,
    range: undefined as any // 使用 any 类型绕过类型检查
  };
}

// 获取字段类型的补全项
function getFieldTypeCompletions(field: ONESQLField): monaco.languages.CompletionItem[] {
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
function getFunctionArgCompletions(func: ONESQLFunction): monaco.languages.CompletionItem[] {
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
          '项目名称',
          '例如："路线图"'
        ),
        createCompletionItem(
          '"版本标题"',
          monaco.languages.CompletionItemKind.Value,
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

// 获取当前上下文的补全项
function getContextAwareCompletions(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): monaco.languages.CompletionItem[] {
  const textUntilPosition = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  });
  
  const words = textUntilPosition.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  
  // 如果最后一个词是字段名，返回该字段支持的运算符和函数
  if (ONESQL_FIELDS.includes(lastWord as ONESQLField)) {
    return getFieldTypeCompletions(lastWord as ONESQLField);
  }
  
  // 如果最后一个词是运算符，返回该运算符支持的值类型
  if (ONESQL_OPERATORS.includes(lastWord as ONESQLOperator)) {
    return [
      createCompletionItem('EMPTY', monaco.languages.CompletionItemKind.Keyword),
      createCompletionItem('NULL', monaco.languages.CompletionItemKind.Keyword),
      createCompletionItem('TRUE', monaco.languages.CompletionItemKind.Keyword),
      createCompletionItem('FALSE', monaco.languages.CompletionItemKind.Keyword)
    ];
  }
  
  // 如果最后一个词是函数名，返回该函数的参数补全
  if (ONESQL_FUNCTIONS.includes(lastWord as ONESQLFunction)) {
    return getFunctionArgCompletions(lastWord as ONESQLFunction);
  }
  
  // 如果最后一个词是 ORDER BY，返回字段列表
  if (lastWord === 'ORDER BY') {
    return ONESQL_FIELDS.map(field => 
      createCompletionItem(
        field,
        monaco.languages.CompletionItemKind.Field,
        `字段: ${field}`
      )
    );
  }
  
  // 如果最后一个词是字段名，且前面有 ORDER BY，返回排序方向
  if (words[words.length - 2] === 'ORDER BY' && ONESQL_FIELDS.includes(lastWord as ONESQLField)) {
    return [
      createCompletionItem('ASC', monaco.languages.CompletionItemKind.Keyword),
      createCompletionItem('DESC', monaco.languages.CompletionItemKind.Keyword)
    ];
  }
  
  // 默认返回所有字段、关键字和函数
  return [
    ...ONESQL_FIELDS.map(field => 
      createCompletionItem(
        field,
        monaco.languages.CompletionItemKind.Field,
        `字段: ${field}`
      )
    ),
    ...ONESQL_KEYWORDS.map(keyword =>
      createCompletionItem(
        keyword,
        monaco.languages.CompletionItemKind.Keyword,
        `关键字: ${keyword}`
      )
    ),
    ...ONESQL_FUNCTIONS.map(func =>
      createCompletionItem(
        func,
        monaco.languages.CompletionItemKind.Function,
        `函数: ${func}`
      )
    )
  ];
}

// 注册 ONESQL 语言的补全提供者
export function registerONESQLCompletionProvider(): monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider('onesql', {
    triggerCharacters: [' ', '.', '=', '>', '<', '!', '~', '(', ')', ','],
    
    provideCompletionItems: (model, position) => {
      const completions = getContextAwareCompletions(model, position);
      
      return {
        suggestions: completions,
        incomplete: false
      };
    }
  });
} 