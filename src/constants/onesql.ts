// 字段列表
export const ONESQL_FIELDS = [
  '标题', '创建时间', '创建者', '更新时间', '工作项类型', '子工作项类型', '所属项目',
  '处理结果', '发布进度', '发布日期', '负责人', '故事点', '关联发布', '所属史诗',
  'ID', '截止日期', '解决者', '缺陷类型', '是否线上缺陷', '所属产品', '所属迭代',
  '描述'
] as const;

// 关键字列表 - 确保包含所有ONESQL关键字
export const ONESQL_KEYWORDS = [
  'AND', 'OR', 'NOT', 'IN', 'NOT IN', 'IS', 'IS NOT', 'EMPTY', 'NULL', 'TRUE', 'FALSE',
  'ORDER BY', 'ORDER', 'BY', 'ASC', 'DESC'
] as const;

// 运算符列表 - 包含所有比较和文本运算符
export const ONESQL_OPERATORS = [
  '=', '!=', '>', '>=', '<', '<=', '~', '!~', 'IN', 'NOT IN', 'IS', 'IS NOT'
] as const;

// 函数列表
export const ONESQL_FUNCTIONS = [
  'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_NULL', 'IS_NOT_NULL',
  'membersOf', 'currentUser', 'currentLogin', 'lastLogin', 'now',
  'startOfDay', 'startOfWeek', 'startOfMonth', 'startOfSeason', 'startOfYear',
  'endOfDay', 'endOfWeek', 'endOfMonth', 'endOfSeason', 'endOfYear',
  'releasedVersions', 'unreleasedVersions', 'inprogressSprints', 'doneSprints',
  'todoSprints', 'issueHistory', 'standardIssueTypes', 'subIssueTypes'
] as const;

// 定义类型
export type ONESQLField = typeof ONESQL_FIELDS[number];
export type ONESQLKeyword = typeof ONESQL_KEYWORDS[number];
export type ONESQLOperator = typeof ONESQL_OPERATORS[number];
export type ONESQLFunction = typeof ONESQL_FUNCTIONS[number];

// 字段类型映射
export const FIELD_TYPES: Record<string, ONESQLField[]> = {
  '工作项类型': ['工作项类型', '子工作项类型'],
  '单选菜单': ['处理结果', '缺陷类型', '是否线上缺陷'],
  '单行文本': ['标题', '创建者', '负责人', '解决者'],
  '多行文本': ['描述'],
  '日期': ['创建时间', '更新时间', '发布日期', '截止日期'],
  '整数': ['故事点'],
  '浮点数': ['发布进度'],
  '工作项': ['关联发布', '所属史诗', '所属产品', '所属迭代'],
  '项目': ['所属项目']
};

// 运算符支持的字段类型
export const OPERATOR_FIELD_TYPES: Record<string, (keyof typeof FIELD_TYPES)[]> = {
  '=': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  '!=': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  '>': ['日期', '整数', '浮点数'],
  '>=': ['日期', '整数', '浮点数'],
  '<': ['日期', '整数', '浮点数'],
  '<=': ['日期', '整数', '浮点数'],
  '~': ['单行文本', '多行文本'],
  '!~': ['单行文本', '多行文本'],
  'IN': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'NOT IN': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'IS': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'IS NOT': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目']
};

// 函数支持的字段类型
export const FUNCTION_FIELD_TYPES: Record<string, (keyof typeof FIELD_TYPES)[]> = {
  'IS_EMPTY': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'IS_NOT_EMPTY': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'IS_NULL': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'IS_NOT_NULL': ['工作项类型', '单选菜单', '单行文本', '多行文本', '日期', '整数', '浮点数', '工作项', '项目'],
  'membersOf': ['单行文本'],
  'currentUser': ['单行文本'],
  'currentLogin': ['单行文本'],
  'lastLogin': ['单行文本'],
  'now': ['日期'],
  'startOfDay': ['日期'],
  'startOfWeek': ['日期'],
  'startOfMonth': ['日期'],
  'startOfSeason': ['日期'],
  'startOfYear': ['日期'],
  'endOfDay': ['日期'],
  'endOfWeek': ['日期'],
  'endOfMonth': ['日期'],
  'endOfSeason': ['日期'],
  'endOfYear': ['日期'],
  'releasedVersions': ['工作项'],
  'unreleasedVersions': ['工作项'],
  'inprogressSprints': ['工作项'],
  'doneSprints': ['工作项'],
  'todoSprints': ['工作项'],
  'issueHistory': ['工作项'],
  'standardIssueTypes': ['工作项类型'],
  'subIssueTypes': ['工作项类型']
};

// 时间函数参数格式
export const TIME_FUNCTION_PARAM_FORMAT = /^[+-]?\d+(y|M|w|d|h|m)?$/;

// 日期时间格式
export const DATE_TIME_FORMATS = {
  DATE: /^\d{4}[-/]\d{2}[-/]\d{2}$/,
  TIME: /^\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}$/,
  RELATIVE_TIME: /^[+-]\d+(y|M|w|d|h|m)$/
} as const; 