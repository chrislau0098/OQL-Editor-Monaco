import * as ohm from 'ohm-js';
import onesqlGrammar from './onesql.ohm.ts';

// 创建 Ohm 解析器
let grammar: ohm.Grammar;
try {
  grammar = ohm.grammar(onesqlGrammar);
} catch (error) {
  console.error('Grammar 加载失败:', error);
  // 抛出错误，而不是使用备用语法
  throw new Error('无法加载 ONESQL 语法文件');
}

/**
 * 解析 ONESQL 查询语句
 * @param query ONESQL 查询字符串
 * @returns 解析结果的简化表示
 */
export function parse(query: string): any {
  try {
    const matchResult = grammar.match(query);
    if (matchResult.succeeded()) {
      // 返回解析成功的结果
      return {
        success: true,
        query: query,
        parsed: true,
        message: '语法正确'
      };
    } else {
      throw new Error(matchResult.message);
    }
  } catch (error: any) {
    console.error('解析错误:', error);
    return {
      success: false,
      query: query,
      parsed: false,
      message: error.message || '语法错误'
    };
  }
}

/**
 * 检查 ONESQL 查询语句是否有效
 * @param query ONESQL 查询字符串
 * @returns 是否有效
 */
export function isValid(query: string): boolean {
  try {
    const matchResult = grammar.match(query);
    return matchResult.succeeded();
  } catch (error) {
    return false;
  }
} 