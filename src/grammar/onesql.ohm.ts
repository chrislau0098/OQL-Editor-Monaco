// ONESQL 语法文件，以字符串形式导出
const onesqlGrammar = `
ONESQL {
  Query = _ Condition (LogicalOp Condition)* OrderByClause? // Added leading _
  
  OrderByClause = ("ORDER BY" | "order by") Field ("," Field)* (("ASC" | "asc") | ("DESC" | "desc"))?
  
  Condition = GroupedCondition | BasicCondition
  
  GroupedCondition = "(" Condition ")"
  
  BasicCondition = 
    | Field ("IS_EMPTY" | "is_empty")          -- checkIsEmpty
    | Field ("IS_NOT_EMPTY" | "is_not_empty")  -- checkIsNotEmpty
    | Field ("IS_NULL" | "is_null")           -- checkIsNull
    | Field ("IS_NOT_NULL" | "is_not_null")   -- checkIsNotNull
    | Field TextOp string         -- textOp
    | Field ComparisonOp ValueOrFunction -- compOp
    | ("NOT" | "not") Condition            -- not
  
  LogicalOp = ("AND" | "and") | ("OR" | "or")
  
  ComparisonOp = "=" | "!=" | ">" | ">=" | "<" | "<=" | ("IN" | "in") | ("NOT IN" | "not in") | ("IS" | "is") | ("IS NOT" | "is not")
  
  TextOp = "~" | "!~"
  
  ValueOrFunction = 
    | string
    | number
    | boolean
    | ("EMPTY" | "empty")
    | ("NULL" | "null")
    | Function
  
  Function = FunctionName "(" FunctionArgs? ")"
  
  FunctionArgs = ValueOrFunction ("," ValueOrFunction)*
  
  FunctionName = 
    | ("IS_EMPTY" | "is_empty")
    | ("IS_NOT_EMPTY" | "is_not_empty")
    | ("IS_NULL" | "is_null")
    | ("IS_NOT_NULL" | "is_not_null")
    | ("membersOf" | "membersof")
    | ("currentUser" | "currentuser")
    | ("currentLogin" | "currentlogin")
    | ("lastLogin" | "lastlogin")
    | ("now" | "now")
    | ("startOfDay" | "startofday")
    | ("startOfWeek" | "startofweek")
    | ("startOfMonth" | "startofmonth")
    | ("startOfSeason" | "startofseason")
    | ("startOfYear" | "startofyear")
    | ("endOfDay" | "endofday")
    | ("endOfWeek" | "endofweek")
    | ("endOfMonth" | "endofmonth")
    | ("endOfSeason" | "endofseason")
    | ("endOfYear" | "endofyear")
    | ("releasedVersions" | "releasedversions")
    | ("unreleasedVersions" | "unreleasedversions")
    | ("inprogressSprints" | "inprogresssprints")
    | ("doneSprints" | "donesprints")
    | ("todoSprints" | "todosprints")
    | ("issueHistory" | "issuehistory")
    | ("standardIssueTypes" | "standardissuetypes")
    | ("subIssueTypes" | "subissuetypes")
  
  Field = ident
  
  string = "\\"" stringChar* "\\"" | "'" stringChar* "'"
  
  stringChar = ~("\\"" | "'") any
  
  number = digit+ ("." digit+)?
  
  boolean = ("TRUE" | "true") | ("FALSE" | "false")
  
  ident = unicodeLetter (unicodeLetter | unicodeDigit | "_")*
  
  unicodeLetter = "a".."z" | "A".."Z" | "\\u4E00".."\\u9FFF" // Use CJK range instead of \\p{L}
  
  unicodeDigit = "0".."9" | "\\\\p{N}"   // Keep \\p{N}
  
  _ = whitespace*
  
  whitespace = " " | "\\t" | "\\n" | "\\r"
}
`;

export default onesqlGrammar; 