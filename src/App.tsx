import React, { useState, useEffect } from 'react';
import { ONESQLEditor } from './components/ONESQLEditor';
import './styles/shopify.css';
import * as monaco from 'monaco-editor';
import { parse, isValid } from './grammar/onesqlParser';

const App: React.FC = () => {
  const [query, setQuery] = useState('标题 = "Bug" AND 解决者 = currentUser()');
  const [parseResult, setParseResult] = useState<any>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  // 当查询语句变化时检查语法
  useEffect(() => {
    try {
      const result = parse(query);
      setParseResult(result);
      setHasError(!result.success);
    } catch (error) {
      setHasError(true);
      setParseResult(null);
    }
  }, [query]);

  const handleValidate = (markers: monaco.editor.IMarkerData[]) => {
    setHasError(markers.length > 0);
  };

  // 生成查询条件的友好显示
  const generateQueryDescription = (query: string): string => {
    if (!query || hasError) return '';

    // 这里可以根据需要实现更复杂的查询描述生成逻辑
    return query
      // 先替换较长的关键字，避免部分匹配问题
      .replace(/ORDER BY/g, '按')
      .replace(/NOT IN/g, '不在')
      .replace(/IN/g, '在')
      .replace(/IS NOT/g, '不是')
      .replace(/IS/g, '是')
      // 然后替换单词关键字
      .replace(/\bAND\b/g, '并且')
      .replace(/\bOR\b/g, '或者')
      .replace(/\bNOT\b/g, '非')
      .replace(/ASC/g, '升序排列')
      .replace(/DESC/g, '降序排列')
      // 替换运算符
      .replace(/=/g, '等于')
      .replace(/!=/g, '不等于')
      .replace(/>/g, '大于')
      .replace(/>=/g, '大于等于')
      .replace(/</g, '小于')
      .replace(/<=/g, '小于等于')
      .replace(/~/g, '包含')
      .replace(/!~/g, '不包含')
      // 替换特殊值
      .replace(/EMPTY/g, '为空')
      .replace(/NULL/g, '为空值')
      // 替换函数
      .replace(/currentUser\(\)/g, '当前用户')
      .replace(/now\(\)/g, '当前时间');
  };

  return (
    <div className="shopify-app">
      <header className="app-header">
        <div className="header-logo">
          <h1>ONESQL 编辑器</h1>
        </div>
      </header>

      <main className="app-main">
        <div className="segment-container">
          <div className="segment-header">
            <div className="segment-title">查询语句</div>
          </div>

          <div className="editor-container">
            <ONESQLEditor
              value={query}
              onChange={setQuery}
              onValidate={handleValidate}
              height="200px"
            />
          </div>
        </div>

        <div className="results-container">
          <div className="results-header">
            <h2>语法解析结果</h2>
          </div>
          
          {!hasError && parseResult?.success ? (
            <div className="results-list">
              <div className="result-item">
                <div className="result-title">查询解析成功</div>
                <div className="result-description">
                  {generateQueryDescription(query)}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <svg viewBox="0 0 20 20" width="32" height="32">
                  <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-9a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#8C9196" />
                </svg>
              </div>
              <h3>查询语法错误</h3>
              <p>{parseResult?.message || '请修正语法错误以查看解析结果'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App; 