import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { registerONESQLLanguage } from '../themes/ONESQLTheme';
import { registerONESQLCompletionProvider } from '../completion/ONESQLCompletionProvider';

interface ONESQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: (errors: monaco.editor.IMarkerData[]) => void;
  height?: string;
  width?: string;
}



export const ONESQLEditor: React.FC<ONESQLEditorProps> = ({ 
  value, 
  onChange, 
  onValidate,
  height = '100%',
  width = '100%'
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 注册 ONESQL 语言和主题 - 必须在创建编辑器之前完成
      registerONESQLLanguage();
      
      // 注册补全提供者
      const completionDisposable = registerONESQLCompletionProvider();
      
      // 创建编辑器实例
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language: 'onesql',
        theme: 'onesql', // 确保使用我们自定义的主题
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        fontFamily: '-apple-system, ui-monospace, Menlo, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 22,
        contextmenu: true,
        wordWrap: 'on',
        renderLineHighlight: 'line',
        padding: {
          top: 12,
          bottom: 12
        },
        scrollbar: {
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        },
        suggest: {
          preview: true,
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showWords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showSnippets: true
        }
      });

      // 监听内容变化
      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue() || '';
        onChange(newValue);
      });

      // 监听验证
      editorRef.current.onDidChangeModelDecorations(() => {
        const model = editorRef.current?.getModel();
        if (model && onValidate) {
          const markers = monaco.editor.getModelMarkers({ resource: model.uri });
          onValidate(markers);
        }
      });

      // 确保主题已应用
      monaco.editor.setTheme('onesql');

      // 组件卸载时清理
      return () => {
        completionDisposable.dispose();
        editorRef.current?.dispose();
      };
    }
  }, []);

  // 更新编辑器内容
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height, 
        width, 
        borderRadius: '0',
        overflow: 'hidden',
        border: 'none'
      }} 
    />
  );
}; 